import { pool } from "../config/database.js";

const transactionLogTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS transactionLog (
        vendorId INT ,
        id SERIAL PRIMARY KEY,
        isDeleted BOOLEAN ,
        amount VARCHAR(100),
        category INT,
        receipt INT,
        accountNo INT,
        vat_gst_amount VARCHAR(100),
        vat_gst_percentage VARCHAR(100),
        desc1 VARCHAR(100),
        desc2 VARCHAR(100),
        desc3 VARCHAR(500),

        type VARCHAR(100) ,
        updatedByuserId INT NOT NULL,
        transactionId INT NOT NULL,
        FOREIGN KEY (updatedByuserId) REFERENCES users(id),
        FOREIGN KEY (vendorId) REFERENCES vendors(id),
        FOREIGN KEY (transactionId) REFERENCES transaction(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

//   const transactionAndTransactionLogProcedureQuery = `CREATE OR REPLACE PROCEDURE update_transaction_with_log(
//     p_transaction_id INT,
//     p_new_amount VARCHAR(100),
//     p_new_category VARCHAR(100),
//     p_new_type VARCHAR(100),
//     p_updatedByUserId INT
// )
// LANGUAGE plpgsql
// AS $$
// DECLARE
//     v_existing_transaction RECORD;
//     v_change_detected BOOLEAN := FALSE;
// BEGIN
//     -- Fetch current transaction details
//     SELECT * INTO v_existing_transaction FROM transaction WHERE id = p_transaction_id;
    
//     -- Ensure transaction exists before updating
//     IF NOT FOUND THEN
//         RAISE EXCEPTION 'Transaction ID % not found', p_transaction_id;
//     END IF;

//     -- Check if any changes are detected
//     IF (p_new_amount IS DISTINCT FROM v_existing_transaction.amount) OR
//        (p_new_category IS DISTINCT FROM v_existing_transaction.category) OR
//        (p_new_type IS DISTINCT FROM v_existing_transaction.type) THEN
//         v_change_detected := TRUE;
//     END IF;

//     -- Insert log only if changes were detected
//     IF v_change_detected THEN
//         INSERT INTO transactionLog (
//             amount,
//             category,
//             type,
//             updatedByuserId,
//             transactionId,
//             created_at
//         ) VALUES (
//             CASE WHEN p_new_amount IS DISTINCT FROM v_existing_transaction.amount THEN p_new_amount ELSE NULL END,
//             CASE WHEN p_new_category IS DISTINCT FROM v_existing_transaction.category THEN p_new_category ELSE NULL END,
//             CASE WHEN p_new_type IS DISTINCT FROM v_existing_transaction.type THEN p_new_type ELSE NULL END,
//             p_updatedByuserId,
//             p_transaction_id,
//             NOW()
//         );

//         -- Update the transaction table
//         UPDATE transaction
//         SET amount = COALESCE(p_new_amount, amount),
//             category = COALESCE(p_new_category, category),
//             type = COALESCE(p_new_type, type)
//         WHERE id = p_transaction_id;
//     END IF;
// END;
// $$;
// `;

const transactionAndTransactionLogProcedureQuery =  `CREATE OR REPLACE PROCEDURE update_transaction_with_log(
    p_transaction_id INT,
    p_new_amount VARCHAR(100),
    p_new_category VARCHAR(100),
    p_new_type VARCHAR(100),
    p_new_accountNo VARCHAR(500),
    p_new_vat_gst_amount VARCHAR(100),
    p_new_vat_gst_percentage VARCHAR(100),
    p_new_desc1 VARCHAR(100),
    p_new_desc2 VARCHAR(100),
    p_new_desc3 VARCHAR(500),
    p_updatedByUserId INT,
    p_new_receiptId INT,
    p_vendorId INT
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

    -- Detect if any field has changed
    IF (p_new_amount IS DISTINCT FROM v_existing_transaction.amount) OR
       (p_new_category IS DISTINCT FROM v_existing_transaction.category) OR
       (p_new_type IS DISTINCT FROM v_existing_transaction.type) OR
       (p_new_accountNo IS DISTINCT FROM v_existing_transaction.accountNo) OR
       (p_new_vat_gst_amount IS DISTINCT FROM v_existing_transaction.vat_gst_amount) OR
       (p_new_vat_gst_percentage IS DISTINCT FROM v_existing_transaction.vat_gst_percentage) OR
       (p_new_desc1 IS DISTINCT FROM v_existing_transaction.desc1) OR
       (p_new_desc2 IS DISTINCT FROM v_existing_transaction.desc2) OR
       (p_new_desc3 IS DISTINCT FROM v_existing_transaction.desc3) OR
       (p_new_receiptId IS DISTINCT FROM v_existing_transaction.receipt) OR
       (p_vendorId IS DISTINCT FROM v_existing_transaction.vendorId)
    THEN
        v_change_detected := TRUE;
    END IF;

    -- Insert log only if something changed
    IF v_change_detected THEN
        INSERT INTO transactionLog (
            vendorId,
            amount,
            category,
            type,
            accountNo,
            vat_gst_amount,
            vat_gst_percentage,
            desc1,
            desc2,
            desc3,
            receipt,
            updatedByuserId,
            transactionId,
            created_at
        ) VALUES (
            CASE WHEN p_vendorId IS DISTINCT FROM v_existing_transaction.vendorId THEN p_vendorId ELSE NULL END,
            CASE WHEN p_new_amount IS DISTINCT FROM v_existing_transaction.amount THEN p_new_amount ELSE NULL END,
            CASE WHEN p_new_category IS DISTINCT FROM v_existing_transaction.category THEN p_new_category ELSE NULL END,
            CASE WHEN p_new_type IS DISTINCT FROM v_existing_transaction.type THEN p_new_type ELSE NULL END,
            CASE WHEN p_new_accountNo IS DISTINCT FROM v_existing_transaction.accountNo THEN p_new_accountNo ELSE NULL END,
            CASE WHEN p_new_vat_gst_amount IS DISTINCT FROM v_existing_transaction.vat_gst_amount THEN p_new_vat_gst_amount ELSE NULL END,
            CASE WHEN p_new_vat_gst_percentage IS DISTINCT FROM v_existing_transaction.vat_gst_percentage THEN p_new_vat_gst_percentage ELSE NULL END,
            CASE WHEN p_new_desc1 IS DISTINCT FROM v_existing_transaction.desc1 THEN p_new_desc1 ELSE NULL END,
            CASE WHEN p_new_desc2 IS DISTINCT FROM v_existing_transaction.desc2 THEN p_new_desc2 ELSE NULL END,
            CASE WHEN p_new_desc3 IS DISTINCT FROM v_existing_transaction.desc3 THEN p_new_desc3 ELSE NULL END,
            CASE WHEN p_new_receiptId IS DISTINCT FROM v_existing_transaction.receipt THEN p_new_receiptId ELSE NULL END,
            p_updatedByUserId,
            p_transaction_id,
            NOW()
        );

        -- Update transaction
        UPDATE transaction
        SET amount = COALESCE(p_new_amount, amount),
            category = COALESCE(p_new_category, category),
            type = COALESCE(p_new_type, type),
            accountNo = COALESCE(p_new_accountNo, accountNo),
            vat_gst_amount = COALESCE(p_new_vat_gst_amount, vat_gst_amount),
            vat_gst_percentage = COALESCE(p_new_vat_gst_percentage, vat_gst_percentage),
            desc1 = COALESCE(p_new_desc1, desc1),
            desc2 = COALESCE(p_new_desc2, desc2),
            desc3 = COALESCE(p_new_desc3, desc3),
            receipt = COALESCE(p_new_receiptId, receipt),
            vendorId = COALESCE(p_vendorId, vendorId)
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
