import { z } from "zod";

export const signupSchema = z.object({
  event_id: z.string().uuid(),
  email: z.string().email("Nieprawidłowy adres email"),
  name: z.string().min(1, "Imię jest wymagane").max(200),
  consent_rodo: z.literal(true, {
    errorMap: () => ({ message: "Wymagana zgoda na przetwarzanie danych" }),
  }),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
