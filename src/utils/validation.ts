import { z } from 'zod';

// Input validation schemas
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters" })
  .max(128, { message: "Password must be less than 128 characters" });

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Display name is required" })
  .max(100, { message: "Display name must be less than 100 characters" });

export const companyNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Company name is required" })
  .max(100, { message: "Company name must be less than 100 characters" });

export const slugSchema = z
  .string()
  .trim()
  .min(1, { message: "Slug is required" })
  .max(50, { message: "Slug must be less than 50 characters" })
  .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" });

// Form validation schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema.optional(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const companySchema = z.object({
  name: companyNameSchema,
  slug: slugSchema,
});

// Utility functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { general: 'Validation failed' } };
  }
};

// URL/Encoding validation for external API calls
export const sanitizeForUrl = (input: string): string => {
  return encodeURIComponent(input.trim());
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};