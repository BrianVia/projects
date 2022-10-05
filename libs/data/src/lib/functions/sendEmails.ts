import { MailService } from '@sendgrid/mail';
import { Domain } from '../interfaces';
import { Profile } from '../interfaces';
import { supabase } from '../services';

import { sleep } from '../utilities';
import 'dotenv/config';
import { Logger } from '@wordly-domains/logger';

const logger = new Logger();

export async function sendEmails() {
  logger.info('Sending emails');
  // const users = await getUsers();
  const profiles = await getUserProfiles();

  const availableDomains = await getAvailableDomains();
  const sendGridMailService: MailService = new MailService();
  sendGridMailService.setApiKey(
    process.env.SENDGRID_API_KEY || 'NO-KEY-PROVIDED'
  );

  profiles.forEach((profile) => {
    const userDomains = getUserDomains(
      profile.word_preferences,
      availableDomains
    );
    logger.debug(`Found domains for ${profile.email}: ${userDomains.length}`);
    if (userDomains.length > 0) {
      logger.debug(`Sending email to ${profile.email}`);
      (async () => {
        try {
          sendGridMailService.send(
            {
              from: 'delivery@wordly.domains',
              to: profile.email,
              subject: `Domains coming soon you may want - ${new Date()
                .toISOString()
                .replace(/T.*/, '')}`,
              text: userDomains.map((domain) => domain.name).join(', \n'),
            },
            false,
            (error, result) => {
              if (error) {
                logger.error(error.toString());
              } else {
                logger.debug(result.toString());
              }
            }
          );
        } catch (error) {
          if (error.response) {
            logger.error(error.response.body);
          }
        }
      })();
    }
  });

  return new Promise((resolve) => {
    resolve("INFO: Sent emails to users' email addresses");
  });
}

async function getUserProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from<Profile>('profiles')
    .select('email, word_preferences,active_subscription');
  return data || [];
}

async function getUsers() {
  const { data, error } = await supabase.auth.api.listUsers();
  const users = data?.map((user) => {
    return {
      id: user.id,
      email: user.email,
    };
  });
  return users;
}

async function getAvailableDomains() {
  const availableDomains: Domain[] = [];
  logger.debug('getAvailableDomains()');
  logger.debug('querying domains table');
  for (let i = 0; i < 4; i++) {
    const { data, error, status } = await supabase
      .from<Domain>('domains')
      .select('name, tld, date_available, subwords')
      .limit(1000)
      .range(i * 1000, (i + 1) * 1000);
    sleep(1000);
    availableDomains.push(...(data || []));
  }

  logger.debug(`Retrieved ${availableDomains.length} domains from DB`);
  return availableDomains;
}

function getUserDomains(wordPreferences: string[], availableDomains: Domain[]) {
  return availableDomains.filter((domain) => {
    return wordPreferences.some((word) => {
      return domain.subwords.includes(word);
    });
  });
}
