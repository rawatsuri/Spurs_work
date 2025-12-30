import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { BadRequestError } from '@/exceptions/BadRequestError';
import { chatService } from '@/services/chat.service';

export const chatController = {
  getSessions: asyncHandler(async (req: Request, res: Response) => {
    const sessions = await chatService.getSessions();
    res.status(StatusCodes.OK).json(sessions);
  }),

  createSession: asyncHandler(async (req: Request, res: Response) => {
    const session = await chatService.createSession();
    res.status(StatusCodes.CREATED).json(session);
  }),

  getSession: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('Session ID is required');
    }
    const session = await chatService.getSession(id);
    res.status(StatusCodes.OK).json(session);
  }),

  deleteSession: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('Session ID is required');
    }
    await chatService.deleteSession(id);
    res.status(StatusCodes.NO_CONTENT).send();
  }),

  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content, model } = req.body;

    console.log('sendMessage - Model received:', model);

    if (!id) {
      throw new BadRequestError('Session ID is required');
    }

    if (!content || typeof content !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Message content is required' });
      return;
    }

    const result = await chatService.sendMessage(id, content, model);
    res.status(StatusCodes.OK).json(result);
  }),
};
