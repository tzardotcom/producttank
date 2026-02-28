import { z } from "zod";

export const feedbackSchema = z.object({
  event_id: z.string().uuid(),
  email: z.string().email("Nieprawidłowy adres email"),
  score: z.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
