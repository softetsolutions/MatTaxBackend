import { pool } from "../config/database.js";

class transactionRepositery {
  async createTransaction(body) {
    // const fields = Object.keys(body);
    // const values = Object.values(body);
    // const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO transaction (${Object.keys(body).join(', ')}) VALUES (${Object.keys(body).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *;`;
    return (await pool.query(query, Object.values(body))).rows[0];
  }

  async getTransactionByUserId(userId) {
    return (await pool.query("SELECT * FROM transaction where userid = $1",[userId])).rows;
  }

  async getTransactionByTransactionId(transactionId){
    return (await pool.query("SELECT * FROM transaction where id = $1",[transactionId])).rows;
  }



  async updateTransaction(body) {
    await pool.query("CALL update_transaction_with_log($1, $2, $3, $4, $5)", [
      body.transactionId,
      body.newAmount,
      body.newCategory,
      body.newType,
      body.updatedByUserId
    ]);
  }

  // async deleteTransaction(id) {
  // }
  
}

export default new transactionRepositery();
