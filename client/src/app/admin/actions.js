"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

// Define the path to the content JSON file
const contentFilePath = path.join(process.cwd(), "src", "data", "siteContent.json");

export async function getSiteContent() {
  try {
    const fileContents = await fs.readFile(contentFilePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading site content:", error);
    throw new Error("Failed to read site content");
  }
}

export async function updateSiteContent(newData) {
  try {
    // Validate if newData is an object
    if (typeof newData !== "object" || newData === null) {
      throw new Error("Invalid data format");
    }

    // Write back to the file with nice formatting
    await fs.writeFile(contentFilePath, JSON.stringify(newData, null, 2), "utf8");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error updating site content:", error);
    return { success: false, message: error.message };
  }
}


export async function uploadImage(formData) {
  try {
    const file = formData.get("file");
    if (!file) {
      return { success: false, message: "No file provided" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || "";
    const key = `SER-${randomUUID()}${ext}`;
    const bucket = process.env.APP_AWS_S3_BUCKET_NAME || "juj4-shop-assets-2026";
    const region = process.env.APP_AWS_REGION || "eu-north-1";

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    });

    await s3Client.send(command);

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { success: true, url, key };
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    return { success: false, message: error.message };
  }
}

