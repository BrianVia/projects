import { Domain } from '@wordly-domains/data';

export function generateEmail(domains: Domain[]): string {
  return `
  <html>
  Good morning, below you will find the domains that will soon be available for purchase, based on your preferences. <br />
  <div style="margin: 1em 0.5em">
    ${generateDomainTable(domains)}
  </div>
  <br />
  <p>
    If you have feedback or suggestions, please email <a href="mailto:feedback@wordly.domains">feedback@wordly.domains</a>
  </p>
  <p>
    If you would like to change your preferences, please visit https://wordly.domains/profile
    <br />To unsubscribe from these emails, please visit https://wordly.domains/unsubscribe
  </p>
  </html>`;
}

export function generateDomainTable(domains: Domain[]) {
  const today = new Date();
  const sortedDomains = domains.sort((a, b) => {
    // sort by date available
    if (a.date_available < b.date_available) {
      return -1;
    }
    if (a.date_available > b.date_available) {
      return 1;
    }
    return 0;
  });
  let table = `<table style="width:100%">
  <tr>
    <th>Name</th>
    <th>Date Available</th> 
    <th>Preorder/Purchase</th>
  </tr>`;
  sortedDomains.forEach((domain) => {
    table += `<tr>
    <td>${domain.name}</td>
    <td>${domain.date_available}</td> 
    ${
      new Date(domain.date_available).valueOf() >= today.valueOf()
        ? `<td><a href="https://park.io/domains/view/${domain.name}">Preorder</a></td>`
        : `<td><a href="https://www.namecheap.com/domains/registration/results/?domain=${domain.name}">Purchase</a></td>`
    }
  </tr>`;
  });
  table += '</table>';
  console.log(table);
  return table;
}
