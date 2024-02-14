import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToASCII as convertToAscii } from "./utils";

let pinecone: Pinecone | null = null;

export const getPinecone = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. Obtain file from S3 and load text
  // TODO: consider using a stream instead of downloading the file
  console.log(`Downloading file from S3: ${fileKey}`);
  const fileName = await downloadFromS3(fileKey);
  if (!fileName) {
    throw new Error("Failed to download file from S3");
  }

  console.log(`Loading file into Pinecone: ${fileName}`);
  const pinecone = await getPinecone();
  const loader = new PDFLoader(fileName);
  const pages = (await loader.load()) as PDFPage[];

  // 2. Split and segment text
  const docs = await Promise.all(pages.map(prepareDocument));

  // 3. Vectorize and embed
  const vectors = await Promise.all(docs.flat().map(embedDocument));

  // 4. Load into Pinecone
  const client = getPinecone();
  const pcIndex = (await client).Index(process.env.PINECONE_INDEX_NAME!);

  console.log(vectors);
  console.log(`Upserting ${vectors.length} vectors into Pinecone`);
  const ns = pcIndex.namespace(convertToAscii(fileKey));
  console.log(`Namespace: ${convertToAscii(fileKey)}`);
  await ns.upsert(vectors);

  console.log(`Upserted ${vectors.length} vectors into Pinecone`);
  return docs[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.error(`Error embedding document: ${error}`);
    throw error;
  }
}

export async function truncateStringByBytes(str: string, length: number) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  if (bytes.length <= length) {
    return str;
  }
  const truncatedBytes = bytes.slice(0, length);
  return new TextDecoder("utf-8").decode(truncatedBytes);
}

export async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/(\r\n|\n|\r)/gm, " ");

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: await truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  return docs;
}
