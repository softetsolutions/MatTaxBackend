import { pool } from "../config/database.js";

const categoryTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS category (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("category (expense) table is ready");
  } catch (error) {
    console.error("Error creating category (expense) table:", error);
    throw error;
  }
};

export default categoryTable;
