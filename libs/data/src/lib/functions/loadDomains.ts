import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill';
import { Logger } from '@common/logger';
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

export async function loadDomains() {
  const domains = [];
  for (const tld of parkIOTLDs) {
    const tldDomains = await getParkIODomains(tld);
    domains.push(...tldDomains);
  }

  const newDomains = await filterOutDomainsWeHave(domains);

  if (newDomains.length > 0) {
    logger.info(`Uploading ${newDomains.length} domains`);
    await upsertDomains(newDomains, supabase);

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

async function getParkIODomains(tld: string) {
  let resultDomains: ParkIODomain[] = [];
  let currentPage = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const response = await axios.get<ParkIOAPIResponse>(
        `https://park.io/domains/index/${tld}/page:${currentPage}.json?limit=1000`
      );
      const data = response.data;

      if (data.success) {
        resultDomains = resultDomains.concat(data.domains);
        currentPage++;
        hasNextPage = data.nextPage && currentPage <= data.pageCount;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      console.error(error);
      hasNextPage = false;
    }
  }

  return resultDomains;
}

async function upsertDomains(
  domains: ParkIODomain[],
  supabase: SupabaseClient
) {
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
