import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import ChatComponent from "@/components/ChatComponent";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  // Get list of chats for the user
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/"); // Redirect to home page if no chats found
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/"); // Redirect to home page if specific chat not found
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  // const _messages = await db
  //   .select()
  //   .from(messages)
  //   .where(eq(messages.chatId, parseInt(chatId)));

  return (
    <div className="max-h-screen" id="chat-page">
      <div className="flex w-full max-h-screen overflow-auto">
        <div className="flex-[1] max-w-xs" id="chat-sidebar-container">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        <div
          className="max-h-screen p-4 overflow-scroll flex-[5]"
          id="pdf-viewer-container"
        >
          <PDFViewer pdfUrl={currentChat?.pdfUrl || ""} />
        </div>
        <div
          className="border-l-4 border-l-slate-200 flex-[3] overflow-scroll p-4"
          id="chat-window-container"
        >
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
