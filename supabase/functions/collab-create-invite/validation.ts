import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

/**
 * Input validation schema for collaboration invite creation
 */
export const CreateInviteSchema = z.object({
  objectiveId: z.string().uuid('Invalid objective ID format'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  role: z.enum(['editor', 'viewer'], {
    errorMap: () => ({ message: 'Role must be either "editor" or "viewer"' })
  })
});

export type CreateInviteRequest = z.infer<typeof CreateInviteSchema>;

/**
 * Validates create invite request input
 */
export const validateCreateInviteRequest = (data: unknown): CreateInviteRequest => {
  return CreateInviteSchema.parse(data);
};