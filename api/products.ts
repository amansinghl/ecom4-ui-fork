import { apiClient } from "@/lib/api-client";
import { ProductsResponseType, ProductType } from "@/types/products";

type ProductsApiResponse = {
  products: ProductsResponseType;
};

type CreateProductApiResponse = {
  product: ProductType;
};

type UpdateProductApiResponse = {
  product: ProductType;
};

export const getProducts = (params?: Record<string, string>) =>
  apiClient<ProductsApiResponse>("products", { params });

export const createProduct = (data: {
  product_name: string;
  brand?: string;
  product_type: string;
  price: string;
  currency: string;
  sku: string;
  hsn_code: number;
  weight: string;
  weight_unit: string;
  inventory_quantity?: number;
  length?: number;
  breadth?: number;
  height?: number;
  unit?: string;
  product_images?: Array<{ src: string }>;
  additional_attributes?: Array<{ identifier: string; value: string }>;
}) =>
  apiClient<CreateProductApiResponse>("products", {
    method: "POST",
    body: data,
  });

export const updateProduct = (
  productId: string | number,
  data: {
    product_name: string;
    brand?: string | null;
    product_type: string;
    price: string;
    currency: string;
    sku: string;
    hsn_code?: number | null;
    weight: string;
    weight_unit: string;
    inventory_quantity?: number | null;
    product_images?: Array<{ src: string }> | null;
  },
) =>
  apiClient<UpdateProductApiResponse>(`products/${productId}`, {
    method: "PUT",
    body: data,
  });

type DeleteProductApiResponse = {
  message: string;
};

export const deleteProduct = (productId: string | number) =>
  apiClient<DeleteProductApiResponse>(`products/${productId}`, {
    method: "DELETE",
  });

