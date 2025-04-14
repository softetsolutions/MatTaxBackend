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
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const DeAuthorizeRecord = async (req, res) => {
    try {
        const body = req.body;
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ error: 'No deletion criteria provided.' });
        }
        const keys = Object.keys(body);
        const values = Object.values(body);
        const conditions = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
        const query = `DELETE FROM authorizeTable WHERE ${conditions} RETURNING *;`;
        const { rows, rowCount } = await pool.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'No matching record found to delete.' });
        }
        res.status(200).json({ message: 'Authorization successfully removed.', id: rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
