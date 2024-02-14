"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Inbox, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

type Props = {};

const FileUpload = (props: Props) => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      fileKey,
      fileName,
    }: {
      fileKey: string;
      fileName: string;
    }) => {
      const res = await axios.post("/api/create-chat", {
        fileKey: fileKey,
        fileName: fileName,
      });
      return res.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too big! Max file size is 10MB");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.fileKey || !data?.fileName) {
          toast.error("Something went wrong with S3 upload");
          return;
        }

        mutate(data, {
          onSuccess: ({ chatId }) => {
            toast.success("Success: Chat created!");
            console.log("Chat created:", chatId);
            router.push(`/chat/${chatId}`);
          },
          onError: (err) => {
            toast.error("Error creating chat - see console");
            console.error(err);
          },
        });

        console.log("data:", data);
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-60 py-8 flex flex-col justify-center items-center",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            {/* loading */}
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Uploading...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here!</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
