import { pool } from "../../../config/database.js";

    export const insertAuthorizeRecord = async (req, res) => {
    try {
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
                INSERT INTO authorizeTable (${keys.join(', ')}) 
                VALUES (${placeholders}) 
                RETURNING *;
            `;

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}