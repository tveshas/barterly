import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), {
  message: "Invalid ObjectId format",
});

export const calculateEqualizationSchema = z.object({
  body: z.object({
    offeredSkillId: objectId,
    requestedSkillId: objectId,
    senderRate: z.coerce.number().min(0).max(10000).optional(),
    receiverRate: z.coerce.number().min(0).max(10000).optional(),
  }),
});
