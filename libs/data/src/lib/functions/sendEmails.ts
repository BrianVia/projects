import { MailService } from '@sendgrid/mail';
import { Domain } from '../interfaces';
import { Profile } from '../interfaces';
import { supabase } from '../services';

import { sleep } from '../utilities';
import 'dotenv/config';

export async function sendEmails() {
  console.info('INFO: sendEmails()');
  // const users = await getUsers();
  const profiles = await getUserProfiles();

  const availableDomains = await getAvailableDomains();
  const sendGridMailService: MailService = new MailService();

  profiles.forEach((profile) => {
    const userDomains = getUserDomains(
      profile.word_preferences,
      availableDomains
    );
    console.debug(
      `DEBUG: Found domains for ${profile.email}: ${userDomains.length}`
    );
    if (userDomains.length > 0) {
      console.debug(`DEBUG: Sending email to ${profile.email}`);
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
                console.error(error);
              } else {
                console.log(result);
              }
            }
          );
        } catch (error) {
          if (error.response) {
            console.error(error.response.body);
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
  console.debug('DEBUG: getAvailableDomains()');
  console.debug('DEBUG: querying domains table');
  for (let i = 0; i < 4; i++) {
    const { data, error, status } = await supabase
      .from<Domain>('domains')
      .select('name, tld, date_available, subwords')
      .limit(1000)
      .range(i * 1000, (i + 1) * 1000);
    sleep(1000);
    availableDomains.push(...(data || []));
  }

  console.debug(`Retrieved ${availableDomains.length} domains from DB`);
  return availableDomains;
}

function getUserDomains(wordPreferences: string[], availableDomains: Domain[]) {
  return availableDomains.filter((domain) => {
    return wordPreferences.some((word) => {
      return domain.subwords.includes(word);
    });
  });
}
