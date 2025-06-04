import { pool } from "../config/database.js";

const authorizeTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS authorizeTable (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    status VARCHAR(100),
    accountId INT NOT NULL,
    FOREIGN KEY (accountId) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (userId, accountId) 
);
  `;

  try {
    await pool.query(query);
    console.log("aurhorize table is created");
  } catch (error) {
    console.error("Error creating authorize table:", error);
  }
};

export default authorizeTable;
