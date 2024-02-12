import { NextResponse } from "next/server";
import {auth} from "@clerk/nextjs";
import toast from "react-hot-toast";
import { loadS3IntoPinecone } from "@/lib/pinecone";


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
    const pages = await loadS3IntoPinecone(fileKey);
    console.log(pages);

    return NextResponse.json({ pages }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}