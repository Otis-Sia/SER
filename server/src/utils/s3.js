import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(file) {
  const ext = path.extname(file.originalname) || "";
  const key = `SER-${randomUUID()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.APP_AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // Return the public URL for the S3 object
  const url = `https://${process.env.APP_AWS_S3_BUCKET_NAME}.s3.${process.env.APP_AWS_REGION}.amazonaws.com/${key}`;
  return { key, url };
}
