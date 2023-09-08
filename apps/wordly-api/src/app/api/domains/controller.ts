import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@wordly-domains/data';
import { Domain } from '@wordly-domains/data';
import { Logger } from '@common/logger';
import { getTokenUser } from '../user/controller';

const logger = new Logger();

class DomainsController {
  async handleDomainsGet(req, res, next) {
    console.log(`received request: GET /api/v1/domains`);
    const token = req.headers.authorization;
    const tokenUser = await getTokenUser(token);
    if (tokenUser) {
      console.debug(`token user found: ${tokenUser?.id}`);
    } else {
      logger.warn(`token user not found`);
      res.status(401).send('Unauthorized');
    }
    const data = await this.fetchDomains();

    res.status(200).json(data);
  }

  async fetchDomains(tlds: string[] = []) {
    const { data: domains, error } = await supabase
      .from<Domain>('domains')
      .select('name, tld, date_available, subwords')
      // .in('tld', tlds)
      .order('tld', { ascending: true });

    if (error) {
      logger.error(error.toString());
      throw error;
    }

    return domains;
  }
}

export { DomainsController };
