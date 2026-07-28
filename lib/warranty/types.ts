export type Warranty = {
  id: string;
  warranty_number: string;
  customer_name: string;
  phone: string;
  region: string;
  place: string;
  installation_date: string;
  product_name: string;
  warranty_period: string;
  installer: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type WarrantySaveInput = {
  id?: string;
  customer_name: string;
  phone: string;
  region: string;
  place: string;
  installation_date: string;
  product_name: string;
  warranty_period: string;
  installer: string;
  notes: string;
};
