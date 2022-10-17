import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@wordly-domains/data';
import { Profile } from '@wordly-domains/data';
import { Logger } from '@wordly-domains/logger';

class UserController {
  async handleUserGet(req, res, next) {
    const userId = req.params.userId;

    // this.logger.info(`received request: GET /api/v1/user/${userId}`);
    const token = req.headers.authorization;
    const tokenUser = await this.getTokenUser(this.removeBearer(token));
    if (tokenUser) {
      //   this.logger.debug(`token user found: ${tokenUser?.id}`);
    } else {
      //   this.logger.warn(`token user not found`);
      res.status(401).send('Unauthorized');
    }

    if (tokenUser?.id !== userId) {
      //   this.logger.warn(`User ${tokenUser?.id} tried to access user ${userId}`);
      res.status(403).send('Forbidden');
    }

    const { profile, error } = await this.fetchUserProfile(userId);
    if (error) {
      //   this.logger.error(error.toString());
      res.status(500).send(error);
    }
    // // this.logger.debug(
    //   `Retrieved profile for ${userId}: ${JSON.stringify(profile)}`
    // );

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
    // this.logger.info(`received request: GET /api/v1/user/${userId}`);
    const token = req.headers.authorization;
    const tokenUser = await this.getTokenUser(this.removeBearer(token));
    if (tokenUser) {
      //   this.logger.debug(`token user found: ${tokenUser?.id}`);
    } else {
      //   this.logger.warn(`token user not found`);
      res.status(401).send('Unauthorized');
    }

    if (tokenUser?.id !== userId) {
      //   this.logger.warn(`User ${tokenUser?.id} tried to update user ${userId}`);
      res.status(403).send('Forbidden');
    }

    const wordPreferences: string[] = req.body.wordPreferences;

    const update = {
      word_preferences: wordPreferences,
      id: userId,
    };

    const { data, error } = await supabase.from('profiles').upsert(update);

    if (error) {
      //   this.logger.error(error.toString());
      res.status(500).send(error);
    }
    res.status(200).send(data);
  }

  private async getTokenUser(token: string) {
    const { data, error } = await supabase.auth.api.getUser(token);
    if (error) {
      console.log(error);
    }
    return data;
  }

  private async fetchUserProfile(
    userId: string
  ): Promise<{ profile: Profile; error: PostgrestError }> {
    const { data: profile, error } = await supabase
      .from<Profile>('profiles')
      .select(`customer_id, word_preferences, active_subscription`)
      .eq('id', userId)
      .single();
    return { profile, error };
  }

  private removeBearer(token: string) {
    return token.replace('Bearer ', '');
  }
}
export { UserController };
