import { apiClient } from "@/lib/api-client";
import { ProductsResponseType } from "@/types/products";

type ProductsApiResponse = {
  meta: { status_code: number; status: string; message: string };
  data: { products: ProductsResponseType };
};

export const getProducts = (params?: Record<string, string>) =>
  apiClient<ProductsApiResponse>("products", { params });

