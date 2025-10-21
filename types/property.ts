export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  code: string;
  primaryImage?: string | null;
  images?: string[] | null;
}
