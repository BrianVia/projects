import { Domain } from '@wordly-domains/data';

export function generateEmail(domains: Domain[]): string {
  return `
  <html>
  Good morning, below you will find the domains that will soon be available for purchase, based on your preferences. \n\n${generateDomainTable(
    domains
  )}\n\n
  If you would like to change your preferences, please visit https://wordly.domains/profile
  To unsubscribe from these emails, please visit https://wordly.domains/unsubscribe
  </html>`;
}

export function generateDomainTable(domains: Domain[]) {
  let table = `<table style="width:100%">
  <tr>
    <th>Name</th>
    <th>Date Available</th> 
    <th>Preorder Link (Park.io)</th>
    <th>Registrar Link</th>
  </tr>`;
  domains.forEach((domain) => {
    table += `<tr>
    <td>${domain.name}</td>
    <td>${domain.date_available.toISOString().replace(/T.*/, '')}</td> 
    <td><a href="https://park.io/domains/view/${domain.name}>Preorder</a>"</td>
    <td><a href="https://www.namecheap.com/domains/registration/results/?domain=${
      domain.name
    }>Purchse on Registrar</a>"</td>
  </tr>`;
  });
  table += '</table>';
  return table;
}
