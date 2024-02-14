import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { UserButton, auth } from "@clerk/nextjs";
import { ChevronRightSquare, LogIn, LogInIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  let firstChat;

  if (userId) {
    firstChat = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .limit(1);

    if (firstChat) firstChat = firstChat[0];
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="flex mt-2">
            {/* Chats button */}
            {isAuth && firstChat && (
              <>
                <Link href={`/chat/${firstChat.id}`}>
                  <Button className="cursor-pointer">
                    Go to chats <ChevronRightSquare className="ml-2" />
                  </Button>
                </Link>
                <div className="ml-3">
                  {/* TODO: implement */}
                  {/* <SubscriptionButton /> */}
                </div>
              </>
            )}
          </div>
          <p className="max-w-xl mt-2 text-lg text-slate-600">
            Join millions of students, scientists, researchers, and
            professionals. Ask questions about any document and get instant
            answers using the power of AI.
          </p>

          <div className="w-full mt-4">
            {/* file upload */}
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Sign in to get started!
                  <LogIn className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {/* Application Screenshot */}
        </div>
      </div>
    </div>
  );
}
