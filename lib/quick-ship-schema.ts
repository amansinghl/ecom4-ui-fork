import { z } from "zod";

const addressSchema = z.object({
  locationType: z.enum(["saved", "one-time"]),
  locationId: z.string().optional(),
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  calling_code: z.string().min(1, "ISD code is required"),
  contact: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .min(1, "Phone number is required"),
  address_line_1: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters")
    .regex(/^[a-zA-Z0-9\s,.-]+$/, "Address contains invalid characters"),
  address_line_2: z.string().optional(),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Pincode must be 6 digits and not start with 0")
    .min(1, "Pincode is required"),
  city: z
    .string()
    .min(1, "City is required")
    .regex(/^[a-zA-Z\s]+$/, "City must contain only letters and spaces"),
  state: z
    .string()
    .min(1, "State is required")
    .regex(/^[a-zA-Z\s]+$/, "State must contain only letters and spaces"),
  country: z
    .string()
    .min(1, "Country is required")
    .regex(/^[a-zA-Z\s]+$/, "Country must contain only letters and spaces"),
});

const productSchema = z.object({
  product_name: z.string().min(1, "Product description is required"),
  product_weight: z.number().optional(),
  product_value: z.number().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
}).refine(
  (data) => data.product_weight !== undefined && data.product_weight > 0,
  {
    message: "Weight is required and must be greater than 0.00 KG",
    path: ["product_weight"],
  }
).refine(
  (data) => data.product_value !== undefined && data.product_value >= 0,
  {
    message: "Product value is required",
    path: ["product_value"],
  }
);

const packageSchema = z.object({
  package_description: z.string().min(1, "Packaging is required"),
  length: z.number().min(1, "Length must be at least 1"),
  breadth: z.number().min(1, "Breadth must be at least 1"),
  height: z.number().min(1, "Height must be at least 1"),
  dimensions_unit: z.enum(["inch", "cm"]),
  weight: z.number().optional(),
  quantity: z.number().int().min(1, "Package quantity must be at least 1"),
});

export const quickShipFormSchema = z
  .object({
    shipmentType: z.enum(["forward", "reverse"]),
    transportMode: z.enum(["express", "surface"]),
    businessType: z.enum(["b2c", "b2b"]).optional(),
    paymentType: z.enum(["prepaid", "cod"]).optional(),

    originAddress: addressSchema,
    destinationAddress: addressSchema,
    useDifferentReturnAddress: z.boolean().default(false),
    returnAddress: addressSchema.optional(),

    branch_id: z.string().min(1, "GST Branch is required"),
    reference1: z.string().optional(),
    reference2: z.string().optional(),
    cod_value: z.number().optional(),

    products: z.array(productSchema).min(1, "At least one product is required"),

    package: packageSchema,
  })
  .refine(
    (data) => {
      // COD value validation: must be <= total product value when paymentType is cod
      if (data.paymentType === "cod" && data.cod_value !== undefined) {
        const totalProductValue = data.products.reduce(
          (sum, product) => sum + (product?.product_value ?? 0) * product.quantity,
          0
        );
        return data.cod_value <= totalProductValue;
      }
      return true;
    },
    {
      message: "COD value must be less than or equal to total product value",
      path: ["cod_value"],
    },
  )
  .refine(
    (data) => {
      if (data.paymentType === "cod") {
        return data.cod_value !== undefined && data.cod_value > 0;
      }
      return true;
    },
    {
      message: "COD value is required when payment type is COD",
      path: ["cod_value"],
    },
  )
  .refine(
    (data) => {
      if (data.useDifferentReturnAddress) {
        return data.returnAddress !== undefined;
      }
      return true;
    },
    {
      message: "Return address is required when using different return address",
      path: ["returnAddress"],
    },
  )
  .refine(
    (data) => {
      if (data.transportMode === "surface") {
        return data.businessType !== undefined;
      }
      return true;
    },
    {
      message: "Business type (B2C/B2B) is required when transport mode is Surface",
      path: ["businessType"],
    },
  );

export type QuickShipFormData = z.infer<typeof quickShipFormSchema>;

