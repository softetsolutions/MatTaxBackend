import { pool } from "../config/database.js";

const transactionTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS transaction (
        id SERIAL PRIMARY KEY,
        isDeleted BOOLEAN NOT NULL,
        amount VARCHAR(100) NOT NULL,
        category INT,
        accountNo INT,
        receipt INT,
        vat_gst_amount VARCHAR(100),
        vat_gst_percentage VARCHAR(100),
        type VARCHAR(100) NOT NULL,
        desc1 VARCHAR(100),
        desc2 VARCHAR(100),
        desc3 VARCHAR(500),
        balance VARCHAR(100),
        userId INT NOT NULL,
        vendorId INT,
        Foreign Key (receipt) REFERENCES receipt(id),
        Foreign Key (category) REFERENCES category(id),
        FOREIGN KEY (accountNo) REFERENCES accountNo(id),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (vendorId) REFERENCES vendors(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Transaction table is ready");
  } catch (error) {
    console.error("Error creating transaction table:", error);
  }
};

export default transactionTable;
