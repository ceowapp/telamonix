import { ZodType, z } from 'zod';
import { PRODUCT } from '@/types/product';

export const ProductSchema: ZodType<PRODUCT> = z.object({
  title: z.string().min(1, { message: 'Title is required' }).nonempty(),
  description: z.string().optional(), // Optional field
  media: z.string().optional(),       // Optional field
  category: z.string().min(1, { message: 'Category is required' }).nonempty(),
  price: z.number().min(0, { message: 'Price must be a positive number' }),
  cost: z.number().min(0, { message: 'Cost must be a positive number' }),
  profit: z.number().min(0, { message: 'Profit must be a positive number' }),
  weight: z.number().min(0, { message: 'Weight must be a positive number' }),
});