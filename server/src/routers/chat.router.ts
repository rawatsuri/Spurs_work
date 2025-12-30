import express from 'express';

import { chatController } from '@/controllers/chat.controller';

export const chatRouter = express.Router();

chatRouter.get('/sessions', chatController.getSessions);
chatRouter.post('/sessions', chatController.createSession);
chatRouter.get('/sessions/:id', chatController.getSession);
chatRouter.delete('/sessions/:id', chatController.deleteSession);
chatRouter.post('/sessions/:id/messages', chatController.sendMessage);
