import { pool } from "../config/database.js";

const clientTable = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS clients (
        clientid SERIAL PRIMARY KEY,
        uid INTEGER NOT NULL,
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
      console.log("Clients (income) table is ready");
    } catch (error) {
      console.error("Error creating clients (income) table:", error);
      throw error;
    }
  };
  export default clientTable;