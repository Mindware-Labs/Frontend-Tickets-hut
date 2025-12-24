export interface Yard {
  id: number;
  name: string;
  commonName: string;
  propertyAddress: string;
  contactInfo: string;
  yardLink?: string;
  notes?: string;
  yardType: "SAAS" | "FULL_SERVICE";
  isActive: boolean;
}

export interface YardFormData {
  name: string;
  commonName: string;
  propertyAddress: string;
  contactInfo: string;
  yardLink: string;
  notes: string;
  yardType: "SAAS" | "FULL_SERVICE";
  isActive: boolean;
}
