import { NextResponse } from 'next/server';
import path from 'path';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function cleanEnv(val) {
  if (!val) return '';
  let s = String(val).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function getS3Client() {
  const accessKeyId = cleanEnv(
    process.env.APP_AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_KEY_ID ||
    process.env.S3_ACCESS_KEY_ID ||
    process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID
  );

  const secretAccessKey = cleanEnv(
    process.env.APP_AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_KEY ||
    process.env.S3_SECRET_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  );

  const region = cleanEnv(
    process.env.APP_AWS_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    process.env.S3_REGION ||
    'eu-north-1'
  );

  const bucketName = cleanEnv(
    process.env.APP_AWS_S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.AWS_BUCKET_NAME ||
    process.env.S3_BUCKET_NAME ||
    process.env.AWS_BUCKET ||
    'juj4-shop-assets-2026'
  );

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS credentials missing. Please set APP_AWS_ACCESS_KEY_ID and APP_AWS_SECRET_ACCESS_KEY in your Vercel Environment Variables.'
    );
  }

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucketName, region };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const { client, bucketName, region } = getS3Client();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name || 'upload.jpg';
    const ext = path.extname(originalName) || '.jpg';
    const cleanExt = ext.toLowerCase();
    const key = `uploads/${randomUUID()}${cleanExt}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    });

    await client.send(command);

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    return NextResponse.json({ success: true, url, key });
  } catch (error) {
    console.error('API Upload Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload image to S3' },
      { status: 500 }
    );
  }
}
