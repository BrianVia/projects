import { MailService } from '@sendgrid/mail';
import { Domain } from '@wordly-domains/data';
import { Profile } from '@wordly-domains/data';
import { supabase } from '@wordly-domains/data';

import { sleep } from '@wordly-domains/data';
import { Logger } from '@wordly-domains/logger';
import { generateEmail } from './email';
import 'dotenv/config';

const logger = new Logger();

export async function sendEmails() {
  logger.info('Sending emails');
  const users = await getUsers();
  const profileDataMap = await getUserProfiles();

  const availableDomains = await getAvailableDomains();
  const sendGridMailService: MailService = new MailService();
  sendGridMailService.setApiKey(
    process.env.SENDGRID_API_KEY || 'NO-KEY-PROVIDED'
  );

  users.forEach(({ email, id }) => {
    const profile = profileDataMap.get(id);
    const userDomains = getUserDomains(
      profile.word_preferences,
      availableDomains
    );
    logger.debug(`Found domains for ${email}: ${userDomains.length}`);
    if (userDomains.length > 0 && profile.active_subscription) {
      console.log(userDomains);
      const emailBody = generateEmail(userDomains);
      logger.debug(`Sending email to ${email}`);
      sendGridMailService.send({
        from: 'delivery@wordly.domains',
        to: email,
        subject: `Domains coming soon you may want - ${new Date()
          .toISOString()
          .replace(/T.*/, '')}`,
        html: emailBody,
      });
    }
  });

  return new Promise((resolve) => {
    resolve("INFO: Sent emails to users' email addresses");
  });
}

async function getUserProfiles(): Promise<Map<string, Profile>> {
  const { data, error } = await supabase
    .from<Profile>('profiles')
    .select('id, word_preferences,active_subscription');
  const userProfileMap = new Map<string, Profile>();
  data.forEach((profile: Profile) => {
    userProfileMap.set(profile.id, profile);
  });
  return userProfileMap;
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
