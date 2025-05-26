import { pool } from "../config/database.js";

const userTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fname VARCHAR(100) NOT NULL,
        lname VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        address_line1 VARCHAR(255),
        city VARCHAR(100),
        postcode VARCHAR(20),       
        country VARCHAR(100),
        ipAddress VARCHAR(100),
        verified BOOLEAN DEFAULT false,
        isLocked VARCHAR(10) DEFAULT 'unlocked',
        role VARCHAR(100) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Users table is ready");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

export default userTable;
