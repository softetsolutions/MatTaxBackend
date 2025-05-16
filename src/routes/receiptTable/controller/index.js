import { pool } from "../../../config/database.js";
import fs from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Tesseract from "tesseract.js";
dotenv.config();

export const getReceipt = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM receipt WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Receipt not found" });
        }
        const imageData = await fs.readFile(result.rows[0].filepath);
        const base64Image = imageData.toString("base64");
        res.status(200).json({ data: base64Image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const API_KEY =
  process.env.GEMINI_API_KEY;
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

export const getTransactionDetailsFromReciept= async (req, res) => {
  try {
    const { path: imagePath } = req.file;
    const ocrText = await extractTextFromImage(imagePath);
    console.log("OCR Text:\n", ocrText);

    const structuredJson = await convertTextToTransactionJson(ocrText);
    fs.unlink(imagePath)
    return res.status(200).json({transactionData: structuredJson});
  } catch (error) {
    fs.unlink(imagePath);
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}

export const deleteReceipt = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM receipt WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Receipt not found" });
        }

        const { filepath } = result.rows[0];
        await fs.unlink(filepath);

        await pool.query("DELETE FROM receipt WHERE id = $1", [id]);

        res.status(200).json({ message: "Receipt deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateReceipt = async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const current = await pool.query("SELECT * FROM receipt WHERE id = $1", [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: "Receipt not found" });
        }

        const oldFilepath = current.rows[0].filepath;

        const { path: filepath, filename } = req.file;
        await pool.query(
            "UPDATE receipt SET filepath = $1, filename = $2 WHERE id = $3",
            [filepath, filename, id]
        );

        await fs.unlink(oldFilepath);

        res.status(200).json({ message: "Receipt updated successfully" });
    } catch (error) {
        console.error("Error updating receipt:", error);
        res.status(500).json({ error: "Failed to update receipt" });
    }
};
