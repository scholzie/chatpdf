import { NextResponse } from "next/server";
import {auth} from "@clerk/nextjs";
import toast from "react-hot-toast";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { db } from "@/lib/db";
import { chatsSchema } from "@/lib/db/schema";
import { getS3Url } from "@/lib/s3";

// /api/create-chat
export async function POST(req: Request, res: Response) {

  const { userId } = await auth();
  if (!userId) {
    toast.error("You must be logged in to create a chat");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fileKey, fileName } = body;
    console.log("fkey, fname:", fileKey, fileName);
    await loadS3IntoPinecone(fileKey);
    const chatId = await db.insert(chatsSchema)
      .values({
        userId,
        fileKey,
        pdfName: fileName,
        pdfUrl: getS3Url(fileKey), 
      })
      .returning({
        insertedId: chatsSchema.id,
      });

    return NextResponse.json({ chatId: chatId[0].insertedId, }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}