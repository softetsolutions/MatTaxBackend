import { pool } from "../config/database.js";

const accountNoTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS accountNo (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      accountNo VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("accountNo (expense) table is ready");
  } catch (error) {
    console.error("Error creating accountNo (expense) table:", error);
    throw error;
  }
};

export default accountNoTable;
