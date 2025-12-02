import { PaginationType, Link, LinksType } from "@/types/shipments";

export type PackageType = {
  id: number | string;
  package_identifier?: string | null;
  length?: number | string | null;
  breadth?: number | string | null;
  height?: number | string | null;
  unit?: string | null;
  default_package?: number | string | boolean | null;
};

export type PackagesType = PackageType[];

export type { PaginationType, Link, LinksType };

export type PackagesResponseType = {
  data: PackagesType | [];
  path: string;
  links: LinksType;
} & PaginationType;

