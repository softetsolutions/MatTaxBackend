import { pool } from "../config/database.js";

class transactionLogRepository {
    async createTransactionLog(body) {
        const query = `INSERT INTO transactionLog (${Object.keys(body).join(', ')}) VALUES (${Object.keys(body).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *;`;
        return (await pool.query(query, Object.values(body))).rows[0];
      }
}

export default new transactionLogRepository();