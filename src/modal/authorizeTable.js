import { pool } from "../config/database.js";

const authorizeTable = async () => {
//   const query = `
//   CREATE TABLE IF NOT EXISTS users (
//       id SERIAL PRIMARY KEY,
//       fname VARCHAR(100) NOT NULL,
//       lname VARCHAR(100) NOT NULL,
//       email VARCHAR(100) UNIQUE NOT NULL,
//       password VARCHAR(255) NOT NULL,
//       token VARCHAR(220),
//       phone VARCHAR(100),
//       address VARCHAR(100),
//       role VARCHAR(100) DEFAULT 'user',
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );
// `;
  const query = `
    CREATE TABLE IF NOT EXISTS authorizeTable (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
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
