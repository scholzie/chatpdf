import AWS from 'aws-sdk';
import fs from 'fs';

export async function downloadFromS3(fileKey:string) {
  try {
    AWS.config.update({
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });

    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      params: { Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME },
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: fileKey,
    };

    const obj = await s3.getObject(params).promise();
    const fileName = `/tmp/pdf-${Date.now()}.pdf`
    fs.writeFileSync(fileName, obj.Body as Buffer);

    return fileName;
  } catch (error) {
    console.error(error);
    return null;
  }  
}