import express from 'express';
import userRouter from './user/index.js';
import authRouter from './userAuth/index.js';
import transactionRouter from './transaction/index.js';
import authorizeAccountRouter from './authorizeTable/index.js';
import verifyToken from '../middleware/verifyAuth.js';
import vendorRouter from './vendor/index.js';

const APIrouter = express.Router();
APIrouter.use('/accountant', verifyToken, authorizeAccountRouter);
APIrouter.use('/user', verifyToken, userRouter);
APIrouter.use('/vendor', vendorRouter);
APIrouter.use('/auth', authRouter);
APIrouter.use('/transaction',verifyToken, transactionRouter);
// APIrouter.use('/transaction', transactionRouter);

export default APIrouter;