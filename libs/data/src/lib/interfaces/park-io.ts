export interface ParkIODomain {
  id: string;
  name: string;
  date_available: string;
  tld: string;
}

export interface ParkIOAPIResponse {
  page: number;
  current: number;
  count: number;
  prevPage: boolean;
  nextPage: boolean;
  pageCount: number;
  limit: number;
  success: boolean;
  domains: ParkIODomain[];
}
