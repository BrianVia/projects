import { Router } from 'express';
import { Logger } from '@wordly-domains/logger';
import { Profile, supabase } from '@wordly-domains/data';

export const userRouter = Router();
const logger = new Logger();

userRouter.get(`/:userId`, async (req, res, next) => {
  const userId = req.params.userId;
  logger.info(`received request: GET /api/v1/user/${userId}`);
  const token = req.headers.authorization;
  const tokenUser = await getTokenUser(removeBearer(token));
  if (tokenUser) {
    logger.debug(`token user found: ${tokenUser?.id}`);
  } else {
    logger.warn(`token user not found`);
    res.status(401).send('Unauthorized');
  }

  if (tokenUser?.id !== userId) {
    logger.warn(`User ${tokenUser?.id} tried to access user ${userId}`);
    res.status(403).send('Forbidden');
  }

  const { data: profile, error } = await supabase
    .from<Profile>('profiles')
    .select(`email, word_preferences, active_subscription`)
    .eq('id', userId)
    .single();

  logger.debug(`Retrieved profile for ${userId}: ${JSON.stringify(profile)}`);

  res.status(200).json({
    id: profile.id,
    customerId: profile.customer_id,
    activeSubscription: profile.active_subscription,
    wordPreferences: profile.word_preferences,
  });
});

function removeBearer(token: string) {
  return token.replace('Bearer ', '');
}

async function getTokenUser(token: string) {
  const { data, error } = await supabase.auth.api.getUser(token);
  if (error) {
    console.log(error);
  }
  return data;
}
