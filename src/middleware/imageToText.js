// gemini-image-to-text.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Tesseract from "tesseract.js";
dotenv.config();

const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyD606sjvBkxhxE41FjuJtBuPYrBOCiWNFY";
const genAI = new GoogleGenerativeAI(API_KEY);

async function extractTextFromImage(imagePath) {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng");
  return text;
}

async function convertTextToTransactionJson(ocrText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    `You are a data processing assistant. Based on the text from a bank receipt or transaction statement below, generate a JSON object following this schema:

{
  "amount": "string",
  "category": "string",
  "type": "credit/debit",
  "desc1": "string",
  "desc2": "string",
  "desc3": "string",
  "balance": "string",
  "userId": 1,
  "vendorId": 1,
  "isDeleted": false
}

Only return valid JSON. No explanations, just the object.

--- Begin Text ---
${ocrText}
--- End Text ---`,
  ]);

  const response = await result.response;
  const textJson = response.text();
  console.log("Structured Transaction JSON:\n", textJson);
  return textJson;
}

// Step 3: Main Function
export async function geminiImageconversion(imagePath) {
  try {
    const ocrText = await extractTextFromImage(imagePath);
    console.log("OCR Text:\n", ocrText);

    const structuredJson = await convertTextToTransactionJson(ocrText);
    return structuredJson;
  } catch (error) {
    fs.unlinkSync(imagePath);
    console.error("Error:", error);
  }
}

const imagePath = path.join(
  __dirname,
  "../../uploads/1745848970089-bank_receipt.jpg"
);
const res = geminiImageconversion(imagePath);
console.log(res);
