import userTable from "./user.js";
import vendorTable from "./vendor.js";
import transactionTable from "./transaction.js";
import transactionLogTable from "./transactionLog.js";
import authorizeTable from "./authorizeTable.js";
import receiptTable from "./receiptTable.js";
import accountNoTable from "./accountNo.js";
import categoryTable from "./category.js";
class entityManager{
    constructor(){
        userTable();
        vendorTable();
        transactionTable();
        transactionLogTable();
        authorizeTable();
        receiptTable();
        accountNoTable();
        categoryTable();
    }
}

export default entityManager;