import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const registerSchema = loginSchema
  .extend({
    confirm: z.string().min(6),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
  });

export const resetEmailSchema = z.object({
  email: z.string().trim().email(),
});

export const passwordUpdateSchema = z
  .object({
    password: z.string().min(6),
    confirm: z.string().min(6),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
  });

export const feedbackSchema = z.object({
  mode_tried: z.string().min(1),
  ease_of_start: z.string().min(1),
  reflection_length: z.string().min(1),
  clarity_help: z.string().min(1),
  would_use_again: z.string().min(1),
  alternative_tool: z.string().min(1),
  saving_blocker: z.string().min(1),
  comparison_feedback: z.string().optional(),
  blocker: z.string().optional(),
  other_thoughts: z.string().max(2000).optional(),
});

export const profileSchema = z.object({
  display_name: z.string().trim().max(80).optional(),
  avatar_url: z.string().nullable().optional(),
  avatar_path: z.string().nullable().optional(),
});

export const adminUserEditSchema = z.object({
  display_name: z.string().trim().max(80).optional(),
  role: z.enum(["user", "tester", "admin"]),
});

export const siteSettingsSchema = z.object({
  app_name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().min(1).max(120),
  logo_url: z.string().trim().min(1).max(500),
});
