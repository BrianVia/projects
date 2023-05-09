import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@wordly-domains/data';
import { Profile } from '@wordly-domains/data';
import { Logger } from '@wordly-domains/logger';

const logger = new Logger();

class UserController {
  async handleUserGet(req, res, next) {
    const userId = req.params.userId;

    logger.info(`received request: GET /api/v1/user/${userId}`);
    const token = req.headers.authorization;
    const tokenUser = await getTokenUser(token);
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

    const { profile, error } = await fetchUserProfile(userId);
    logger.debug(`got user profile: ${profile}`);
    if (error) {
      logger.error(error.toString());
      res.status(500).send(error);
    }
    logger.debug(`Retrieved profile for ${userId}: ${JSON.stringify(profile)}`);

    res.status(200).json({
      id: tokenUser.id,
      email: tokenUser.email ?? '',
      customerId: profile?.customer_id ?? '',
      activeSubscription: profile.active_subscription,
      wordPreferences: profile.word_preferences,
    });
  }

  async handleWordPreferencesUpdate(req, res, next) {
    // update the user's profile with the request word preferences
    const userId = req.params.userId;
    logger.info(
      `received request: POST /api/v1/user/${userId}/wordPreferences`
    );
    const token = req.headers.authorization;
    const tokenUser = await getTokenUser(token);
    if (tokenUser) {
      logger.debug(`token user found: ${tokenUser?.id}`);
    } else {
      logger.warn(`token user not found`);
      res.status(401).send('Unauthorized');
    }

    if (tokenUser?.id !== userId) {
      logger.warn(`User ${tokenUser?.id} tried to update user ${userId}`);
      res.status(403).send('Forbidden');
    }

    const wordPreferences: string[] = req.body.wordPreferences;
    console.log(wordPreferences);
    const update = {
      word_preferences: wordPreferences,
      id: userId,
    };

    const { data, error } = await supabase.from('profiles').upsert(update);

    if (error) {
      console.error(error);
      logger.error(error.toString());
      res.status(500).send(error.toString());
    }
    res.status(200).send(data);
  }

  async handleSubscriptionUpdate(req, res, next) {
    const newSubscriptionValue: boolean = req.body.activeSubscription;
    const userId: string = req.params.userId;
    logger.info(`received request: POST /api/v1/user/${userId}/subscription`);
    const token = req.headers.authorization;
    const tokenUser = await getTokenUser(token);
    if (tokenUser) {
      logger.debug(`token user found: ${tokenUser?.id}`);
    } else {
      logger.warn(`token user not found`);
      res.status(401).send('Unauthorized');
    }

    if (tokenUser?.id !== userId) {
      logger.warn(`User ${tokenUser?.id} tried to update user ${userId}`);
      res.status(403).send('Forbidden');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ active_subscription: newSubscriptionValue })
      .eq('id', userId);

    if (error) {
      console.error(error);
      logger.error(error.toString());
      res.status(500).send(error.toString());
    }
    res.status(200).send(data);
  }
}

async function getTokenUser(token: string) {
  if (token.startsWith('Bearer ')) {
    token = removeBearer(token);
  }
  const { user, error } = await supabase.auth.api.getUser(token);
  if (error) {
    logger.error(error.toString());
  }
  return user;
}

async function fetchUserProfile(
  userId: string
): Promise<{ profile: Profile; error: PostgrestError }> {
  const { data: profile, error } = await supabase
    .from<Profile>('profiles')
    .select(`customer_id, word_preferences, active_subscription`)
    .eq('id', userId)
    .single();
  return { profile, error };
}

function removeBearer(token: string) {
  return token.replace('Bearer ', '');
}
export { UserController, getTokenUser };
