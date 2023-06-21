import winston from 'winston';
import { supabase } from '../supabase';

const logger = winston.createLogger({
  level: process.env.WISHLIST_ALERTS_LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'wishlist-alerts-api' },
});

class AuthService {
  public async getTokenUser(token: string) {
    if (token.startsWith('Bearer ')) {
      token = this.removeBearer(token);
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      logger.error(error.toString());
    }
    return data.user;
  }

  private removeBearer(token: string) {
    return token.replace('Bearer ', '');
  }
}

export { AuthService };
