import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";
import { LogIn, LogInIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
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
            {isAuth && <Button>Go to chats</Button>}
          </div>
          <p className="max-w-xl mt-2 text-lg text-slate">
            Join millions of students, scientists, researchers, and professionals. 
            Ask questions about any document and get instant answers using the power of AI.
          </p>

          <div className="w-full mt-4">
            {/* file upload */}
            {isAuth ? (<h1>File Upload</h1>): (
              <Link href="/sign-in">
                <Button>
                  Sign in to get started!
                  <LogIn className="w-5 h-5 ml-2"/>
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
