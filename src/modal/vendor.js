import { pool } from "../config/database.js";

const vendorTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      address VARCHAR(255),
      email1 VARCHAR(100) UNIQUE NOT NULL,
      email2 VARCHAR(100),
      phone1 VARCHAR(20) NOT NULL,
      phone2 VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Vendors (expense) table is ready");
  } catch (error) {
    console.error("Error creating vendors (expense) table:", error);
    throw error;
  }
};

export default vendorTable;
