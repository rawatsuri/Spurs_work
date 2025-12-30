import express from 'express';

import { chatRouter } from '@/routers/chat.router';
import { userRouter } from '@/routers/user.router';

export const router = express.Router();

router.get('/hello', (_, res) => res.json({ message: 'hi randi ka bachha' }));

router.use('/users', userRouter);
router.use('/chat', chatRouter);
