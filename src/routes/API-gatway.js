import express from 'express';
import userRouter from './user/index.js';
import authRouter from './userAuth/index.js';
import transactionRouter from './transaction/index.js';
import authorizeAccountRouter from './authorizeTable/index.js';
import verifyToken from '../middleware/verifyAuth.js';
import vendorRouter from './vendor/index.js';
import receiptRouter from './receiptTable/index.js';
import adminRouter from './admin/index.js';
import categoryRouter from './category/index.js';
import accountNoRouter from './accountNo/index.js';

const APIrouter = express.Router();
APIrouter.use('/accountant', verifyToken, authorizeAccountRouter);
APIrouter.use('/user', verifyToken, userRouter);
APIrouter.use('/vendor',verifyToken, vendorRouter);
APIrouter.use('/category', verifyToken, categoryRouter);
APIrouter.use('/accountNo', verifyToken, accountNoRouter);
APIrouter.use('/auth', authRouter);
APIrouter.use('/transaction',verifyToken, transactionRouter);
APIrouter.use('/admin', verifyToken, adminRouter);
APIrouter.use('/receipt',verifyToken, receiptRouter);

export default APIrouter;