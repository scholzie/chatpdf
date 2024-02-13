import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const res = await openai.createChatCompletion({
      model: process.env.OPENAI_DEFAULT_CHAT_MODEL!,
      messages,
      stream: true,
    });

    const stream = OpenAIStream(res);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
