import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { ParkIOAPIResponse, ParkIODomain, Domain } from '../interfaces';
import { supabase } from '../services';
import { WORDS } from '../data';

export async function getDomains() {
  const domains = await getParkIODomains()
    .then((data: ParkIOAPIResponse) => {
      console.log(`retrieved ${data.domains.length} domains`);
      return data.domains;
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject('could not fetch domains from Park.IO');
    });

  domains.forEach(async (domain: ParkIODomain) => {
    await loadDomain(domain, supabase);
  });

  return new Promise((resolve) => {
    resolve('Domains fetched and loaded into DB');
  });
}

async function getParkIODomains(page?: number, limit?: number) {
  const { data } = await axios.get(
    `https://park.io/domains/index/io.json?limit=${limit ? limit : 4000}page=${
      page ? page : 1
    }`
  );
  return data;
}

async function loadDomain(domain: ParkIODomain, supabase: SupabaseClient) {
  const subwords = findWords(domain.name, WORDS);
  const { data, error } = await supabase.from<Domain>('domains').upsert(
    {
      name: domain.name,
      tld: domain.tld,
      date_available: new Date(domain.date_available),
      park_io_id: domain.id,
      subwords,
    },
    {
      ignoreDuplicates: true,
      returning: 'minimal',
    }
  );
  console.debug(`loaded domain ${domain.name}`);
  console.debug(`subwords: ${subwords}`);

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
