import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddings } from "./embeddings";
import { convertToASCII } from "./utils";

// Search pinecone for top 5 similar embeddings
export async function getMatchesFromEmbeddings(
  embeddings: number[],
  namespace: string
) {
  if (namespace !== convertToASCII(namespace)) {
    throw new Error("Invalid namespace - must be ASCII");
  }

  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = (await pc).index(process.env.PINECONE_INDEX_NAME!);
    // const index = (await pc).index("chatpdf");
    const ns = index.namespace(namespace);
    const queryResult = await ns.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (e) {
    console.error("error querying embeddings", e);
    throw e;
  }
}

export async function getContext(query: string, namespace: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, namespace);

  // Ensure match scores are above a certain threshold
  const qualifyingDocs = matches.filter((match) => {
    // const score = parseFloat(process.env.PINECONE_MATCH_THRESHOLD!);
    const score = 0.7;
    return match.score && match.score > score;
  });

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((doc) => (doc.metadata as Metadata).text);

  return docs.join("\n").substring(0, 3000);
}
