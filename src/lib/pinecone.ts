import { Pinecone } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter';

let pinecone: Pinecone | null = null;

export const getPinecone = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
}

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
}

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
  const docs = await Promise.all(
    pages.map(prepareDocument)
  );

  // 3. Load vectors into Pinecone
  return pages;
}

export async function truncateStringByBytes(str: string, length: number) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  if (bytes.length <= length) {
    return str;
  }
  const truncatedBytes = bytes.slice(0, length);
  return new TextDecoder('utf-8').decode(truncatedBytes);
}

export async function prepareDocument(page: PDFPage) {
  let {pageContent, metadata} = page;
  pageContent = pageContent.replace(/(\r\n|\n|\r)/gm, " ");

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent, 
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: await truncateStringByBytes(pageContent, 36000)
      }

    })
  ]);

  return docs;

}
