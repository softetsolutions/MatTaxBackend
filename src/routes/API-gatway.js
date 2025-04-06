import express from 'express';
import userRouter from './user/index.js';
import authRouter from './userAuth/index.js';
import transactionRouter from './transaction/index.js';
import authorizeAccountRouter from './authorizeTable/index.js';

const APIrouter = express.Router();
// APIrouter.use('/v1/users', userRouter);
APIrouter.use('/user', authRouter);
APIrouter.use('/user/authorize', authorizeAccountRouter);
APIrouter.use('/users', userRouter);
APIrouter.use('/user/jwt', authRouter);
APIrouter.use('/transaction',transactionRouter);


export default APIrouter;
