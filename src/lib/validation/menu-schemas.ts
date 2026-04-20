import * as z from "zod";

export const menuItemIngredientSchema = z.object({
  ingredient_id: z.string().min(1, "Ingredient is required"),
  quantity_required: z.coerce.number().min(0.001, "Quantity must be greater than 0"),
  unit: z.string().optional(),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  category_id: z.string().optional(),
  is_available: z.boolean().default(true),
  preparation_time: z.coerce.number().optional(),
  dietary_tags: z.string().optional(), // Will be processed as comma-separated string
  allergens: z.string().optional(),    // Will be processed as comma-separated string
  sort_order: z.coerce.number().default(0),
  image_url: z.string().optional(),
  ingredients: z.array(menuItemIngredientSchema).default([]),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
export type MenuItemIngredientValues = z.infer<typeof menuItemIngredientSchema>;
