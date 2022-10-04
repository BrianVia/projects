import { Domain } from '../interfaces';
import { supabase } from '../services';

export async function cleanDomains() {
  const deleteQuery = supabase
    .from<Domain>('domains')
    .delete({ returning: 'minimal' })
    .filter(
      'date_available',
      'lt',
      new Date().toISOString().replace(/T.*/, '')
    );

  await deleteQuery;
  //@TODO: add error handling
  return new Promise((resolve) => {
    resolve(`Removed domains older than today`);
  });
}
