import { PaginationType, Link, LinksType } from "@/types/shipments";

export type ProductMetaType = Record<string, any>;

export type ProductType = {
  id: number | string;
  product_name?: string | null;
  brand?: string | null;
  product_type?: string | null;
  price?: number | string | null;
  currency?: string | null;
  sku?: string | null;
  hsn_code?: number | string | null;
  weight_in_kgs?: number | string | null;
  weight?: number | string | null;
  weight_unit?: string | null;
  inventory_quantity?: number | string | null;
  channel_name?: string | null;
  product_meta: ProductMetaType;
  created_at?: string | null;
};

export type ProductsType = ProductType[];

export type { PaginationType, Link, LinksType };

export type ProductsResponseType = {
  data: ProductsType | [];
  path: string;
  links: LinksType;
} & PaginationType;

