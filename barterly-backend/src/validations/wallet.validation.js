import { z } from "zod";

export const topUpSchema = z.object({
  body: z.object({ amount: z.coerce.number().positive().max(10000) }),
});
