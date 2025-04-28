import { pool } from "../../../config/database.js";
import fs from "fs/promises";

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
