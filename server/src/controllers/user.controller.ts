import asyncErrorWrapper from 'express-async-handler';

import { NotFoundError } from '@/exceptions/NotFoundError';

export const currentUser = asyncErrorWrapper(async () => {
  throw new NotFoundError('User endpoint not available');
});

export const createUser = asyncErrorWrapper(async () => {
  throw new NotFoundError('User endpoint not available');
});
