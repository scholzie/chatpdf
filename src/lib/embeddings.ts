import { OpenAIApi, Configuration, CreateEmbeddingResponse } from "openai-edge";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/(\r\n|\n|\r)/gm, " "),
    });
    const res = (await response.json()) as CreateEmbeddingResponse;
    return res.data[0].embedding as number[];
  } catch (error) {
    console.error("Error calling openai embeddings api:", error);
    throw error;
  }
}
