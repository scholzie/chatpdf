import AWS from 'aws-sdk';
import { PutObjectOutput } from 'aws-sdk/clients/s3';
import { parse, resolve } from 'path';

export async function uploadToS3( file: File ) : Promise<{fileKey: string, fileName: string}> {
  return new Promise((resolve, reject) => {
    try {
      const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        },
      });

      const fileKey = 'uploads/' + Date.now().toString() + file.name.replace(" ", "_");
      const uploadParams = {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: file,
      };

      // TODO: Add progress bar
      s3.putObject(
        uploadParams, 
        (err: any, data: PutObjectOutput | undefined) => {
          return resolve({
            fileKey,
            fileName: file.name,
          });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}


export function getS3Url(fileKey: string) {
  return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;
}