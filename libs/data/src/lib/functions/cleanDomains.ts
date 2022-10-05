import { Logger } from '@wordly-domains/logger';
import { Domain } from '../interfaces';
import { supabase } from '../services';
import 'dotenv/config';

export async function cleanDomains() {
  const logger = new Logger();

  logger.info('Removing domains');
  logger.debug(
    `Removing domains prior to ${getLastWeeksDate()
      .toISOString()
      .replace(/T.*/, '')}`
  );
  const deleteQuery = supabase
    .from<Domain>('domains')
    .delete({ returning: 'minimal' })
    .filter(
      'date_available',
      'lt',
      getLastWeeksDate().toISOString().replace(/T.*/, '')
    );

  await deleteQuery;
  //@TODO: add error handling
  return new Promise((resolve) => {
    resolve(`Removed domains older than today`);
  });
}

function getLastWeeksDate(): Date {
  return new Date(Date.now() - 604800000);
}
