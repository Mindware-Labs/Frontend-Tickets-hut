export interface Landlord {
  id: number;
  name: string;
  phone: string;
  email: string;
  yards?: YardOption[];
}

export interface YardOption {
  id: number;
  name: string;
  commonName?: string;
  landlord?: { id: number; name: string };
}

export interface LandlordFormData {
  name: string;
  phone: string;
  email: string;
  yardIds: string[];
}
