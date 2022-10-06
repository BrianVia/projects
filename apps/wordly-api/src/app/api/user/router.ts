import { Router } from 'express';
import { supabase } from '@wordly-domains/data';
import { SupabaseClient } from '@supabase/supabase-js';
export const userRouter = Router();

userRouter.get(`/:userId`, (req, res, next) => {
  const userId = req.params.userId;
  res.status(200).json(`found user ${userId}`);
});
