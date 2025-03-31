import userTable from "./user.js";
import vendorTable from "./vendor.js";
import transactionTable from "./transaction.js";
import transactionLogTable from "./transactionLog.js";

class entityManager{
    constructor(){
        userTable();
        vendorTable();
        transactionTable();
        transactionLogTable();
    }
}

export default entityManager;