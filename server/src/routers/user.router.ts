import express from 'express';

import { createUser, currentUser } from '@/controllers/user.controller';
import { validate } from '@/middlewares/validation.middleware';
import { createUserSchema } from '@/validations/create-user.schema';

export const userRouter = express.Router();

userRouter.get('/me', currentUser);
userRouter.post('/', validate({ body: createUserSchema }), createUser);
