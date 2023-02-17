import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill';
import { Logger } from '@wordly-domains/logger';
import { ParkIOAPIResponse, ParkIODomain, Domain } from '../interfaces';
import { supabase } from '../services';
import { WORDS } from '../data';
import { sleep } from '../utilities';

const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
const logger = new Logger();

const parkIOTLDs = [
  '.io',
  '.co',
  '.us',
  '.to',
  '.gg',
  '.ly',
  '.vc',
  '.me',
  '.sh',
  '.bz',
  '.ag',
  '.sc',
  '.ac',
  '.lc',
  '.je',
  '.mn',
  '.pro',
  '.info',
  '.red',
];

export async function getDomains() {
  const domains = await getParkIODomains()
    .then((data: ParkIOAPIResponse) => {
      logger.log(`retrieved ${data.domains.length} domains`);
      return data.domains;
    })
    .catch((err) => {
      logger.error(err);
      return Promise.reject('could not fetch domains from Park.IO');
    });

  const newDomains = await filterOutDomainsWeHave(domains);

  if (newDomains.length > 0) {
    logger.info(`Uploading ${newDomains.length} domains`);
    await loadDomains(newDomains, supabase);

    return new Promise((resolve) => {
      logger.info('Domains fetched and loaded into DB');
      resolve('Domains fetched and loaded into DB');
    });
  } else {
    return new Promise((resolve) => {
      logger.info(`No new domains loaded.`);
      resolve('No new domains loaded.');
    });
  }
}

async function filterOutDomainsWeHave(
  domains: ParkIODomain[]
): Promise<ParkIODomain[]> {
  const domainNamesWeAlreadyHave = await getAvailableDomains().then((data) => {
    return data.map((domain) => domain.name);
  });
  const newDomains = domains.filter(
    (domain) => !domainNamesWeAlreadyHave.includes(domain.name)
  );
  logger.info(
    `Removed ${
      domainNamesWeAlreadyHave.length - newDomains.length
    } domains from insert payload.`
  );
  return newDomains;
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

async function getParkIODomains(
  page?: number,
  limit?: number
): Promise<ParkIOAPIResponse> {
  const { data } = await axios.get<ParkIOAPIResponse>(
    `https://park.io/domains/index/all.json?limit=${limit ?? 10000}`
  );
  return data;
}

async function loadDomains(domains: ParkIODomain[], supabase: SupabaseClient) {
  const toUpsertDomains = domains.map((domain) => {
    const subwords = findWords(domain.name, WORDS);
    return {
      name: domain.name,
      tld: domain.tld,
      date_available: Temporal.PlainDate.from(domain.date_available).toString(),
      park_io_id: domain.id,
      subwords,
    };
  });

  const { data, error } = await supabase
    .from<Domain>('domains')
    .upsert(toUpsertDomains, {
      ignoreDuplicates: true,
      returning: 'minimal',
    });
  if (data) {
    if (LOG_LEVEL === 'DEBUG') {
      logger.debug('loaded domains');
      logger.debug(data.toString());
    }
  }
  if (error) {
    logger.error(error.toString());
  }

  return Promise.resolve(true);
}

function findWords(domainName: string, words: string[]) {
  const subwords: string[] = [];
  words.forEach((word) => {
    if (domainName.includes(word)) {
      subwords.push(word);
    }
  });
  return subwords;
}
