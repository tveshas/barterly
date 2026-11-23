import { z } from "zod";

export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string({ required_error: "Google credential is required" }).min(20),
    rememberMe: z.boolean().optional(),
  }),
});

export const devLoginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    key: z.string().max(200).optional(),
  }),
});
