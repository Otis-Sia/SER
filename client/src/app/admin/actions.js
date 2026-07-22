"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

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

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    return { success: true, url: `/uploads/${uniqueFilename}` };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, message: error.message };
  }
}
