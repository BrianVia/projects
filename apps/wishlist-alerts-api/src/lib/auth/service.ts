import { Logger } from '@common/logger';
import { supabase } from '../supabase';

const logger = new Logger();

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
