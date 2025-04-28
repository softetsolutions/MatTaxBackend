import { pool } from "../config/database.js";

const receiptTable = async () => {
    const query = `
            CREATE TABLE IF NOT EXISTS receipt (
            id SERIAL PRIMARY KEY,
            filepath VARCHAR(255) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            transactionId INT NOT NULL,
            FOREIGN KEY (transactionId) REFERENCES transaction(id)
        );
    `;

    try {
        await pool.query(query);
        const result = await pool.query(query);
        console.log("Receipt table is ready");
    } catch (error) {
        console.error("Error creating receipt table:", error);
    }
};

export default receiptTable;
