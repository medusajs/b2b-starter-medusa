"use server";
import "server-only";
import { z } from "zod";
import type { Product, ProductCategory, ProductImage, ProductVariant } from "@/lib/products/types";

// Zod schemas for validation
export const ProductFilterSchema = z.object({
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  search: z.string().optional(),
});

export const ProductSortSchema = z.enum([
  "name",
  "price-asc",
  "price-desc",
  "manufacturer",
  "created-desc",
  "created-asc"
]);

export type ProductFilter = z.infer<typeof ProductFilterSchema>;
export type ProductSort = z.infer<typeof ProductSortSchema>;

// Product categories mapping
export const PRODUCT_CATEGORIES = {
  ACCESSORIES: 'accessories',
  BATTERIES: 'batteries',
  CABLES: 'cables',
  CONTROLLERS: 'controllers',
  EV_CHARGERS: 'ev_chargers',
  INVERTERS: 'inverters',
  KITS: 'kits',
  OTHERS: 'others',
  PANELS: 'panels',
  POSTS: 'posts',
  STRINGBOXES: 'stringboxes',
  STRUCTURES: 'structures'
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];
