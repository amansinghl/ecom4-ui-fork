import { apiClient } from "@/lib/api-client";
import { PackagesResponseType, PackageType } from "@/types/packages";

type PackagesApiResponse = {
  packages: PackagesResponseType;
};

type UpdatePackageApiResponse = {
  message: string;
  package: PackageType;
};

type CreatePackageApiResponse = {
  message: string;
  package: PackageType;
};

export const getPackages = (params?: Record<string, string>) =>
  apiClient<PackagesApiResponse>("packages", { params });

export const createPackage = (data: {
  package_identifier: string;
  length: string;
  breadth: string;
  height: string;
  unit: string;
  default_package: boolean;
}) =>
  apiClient<CreatePackageApiResponse>("packages", {
    method: "POST",
    body: data,
  });

export const updatePackage = (
  packageId: string | number,
  data: {
    package_identifier: string;
    length: string;
    breadth: string;
    height: string;
    unit: string;
    default_package: number;
  },
) =>
  apiClient<UpdatePackageApiResponse>(`packages/${packageId}`, {
    method: "PUT",
    body: data,
  });

