import { pool } from "../config/database.js";

const transactionLogTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS transactionLog (
        vendorId INT ,
        id SERIAL PRIMARY KEY,
        isDeleted BOOLEAN ,
        amount VARCHAR(100),
        category VARCHAR(100) ,
        type VARCHAR(100) ,
        updatedByuserId INT NOT NULL,
        transactionId INT NOT NULL,
        FOREIGN KEY (updatedByuserId) REFERENCES users(id),
        FOREIGN KEY (vendorId) REFERENCES vendor(id),
        FOREIGN KEY (transactionId) REFERENCES transaction(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const transactionAndTransactionLogProcedureQuery = `CREATE OR REPLACE PROCEDURE update_transaction_with_log(
    p_transaction_id INT,
    p_new_amount VARCHAR(100),
    p_new_category VARCHAR(100),
    p_new_type VARCHAR(100),
    p_updatedByUserId INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existing_transaction RECORD;
    v_change_detected BOOLEAN := FALSE;
BEGIN
    -- Fetch current transaction details
    SELECT * INTO v_existing_transaction FROM transaction WHERE id = p_transaction_id;
    
    -- Ensure transaction exists before updating
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction ID % not found', p_transaction_id;
    END IF;

    -- Check if any changes are detected
    IF (p_new_amount IS DISTINCT FROM v_existing_transaction.amount) OR
       (p_new_category IS DISTINCT FROM v_existing_transaction.category) OR
       (p_new_type IS DISTINCT FROM v_existing_transaction.type) THEN
        v_change_detected := TRUE;
    END IF;

    -- Insert log only if changes were detected
    IF v_change_detected THEN
        INSERT INTO transactionLog (
            amount,
            category,
            type,
            updatedByuserId,
            transactionId,
            created_at
        ) VALUES (
            CASE WHEN p_new_amount IS DISTINCT FROM v_existing_transaction.amount THEN p_new_amount ELSE NULL END,
            CASE WHEN p_new_category IS DISTINCT FROM v_existing_transaction.category THEN p_new_category ELSE NULL END,
            CASE WHEN p_new_type IS DISTINCT FROM v_existing_transaction.type THEN p_new_type ELSE NULL END,
            p_updatedByuserId,
            p_transaction_id,
            NOW()
        );

        -- Update the transaction table
        UPDATE transaction
        SET amount = COALESCE(p_new_amount, amount),
            category = COALESCE(p_new_category, category),
            type = COALESCE(p_new_type, type)
        WHERE id = p_transaction_id;
    END IF;
END;
$$;
`;

  try {
    await pool.query(query);
    console.log("Transaction Log table is ready");
    await pool.query(transactionAndTransactionLogProcedureQuery);
    console.log("transactionAndTransactionLogProcedureQuery is ready")
  } catch (error) {
    console.error("Error creating transaction log table:", error);
  }
};

export default transactionLogTable;
