import express from 'express';
import userRouter from './userRoutes.js';
import authRouter from './authRouter.js';
import transactionRouter from './transactionRouter.js'

const APIrouter = express.Router();
// APIrouter.use('/v1/users', userRouter);
APIrouter.use('/user', authRouter);
APIrouter.use('/users', userRouter);
APIrouter.use('/user/jwt', authRouter);
APIrouter.use('/transaction',transactionRouter);


export default APIrouter;
