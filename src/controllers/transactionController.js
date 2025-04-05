import transactionRepository from "../repositery/transactionRepository.js";


const { createTransaction, getTransactionByUserId, updateTransaction } = transactionRepository;

class transactionController {
    async createTransaction(req,res){
        try{
            const transaction = await createTransaction(req.body);
            res.status(201).json(transaction);
        }catch (error){
            res.status(500).json({ error: error.message });
        }
    }

    async getAllTransactionOfUser(req,res){
        try{
            res.status(200).json(await getTransactionByUserId(req.params.id));
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    }

    async updateTransaction(req,res){
        try{
            res.status(200).json(await updateTransaction(req.body))

        }catch(error){
            res.status(500).json({ error: error.message });
        }
    }

}

export default new transactionController();