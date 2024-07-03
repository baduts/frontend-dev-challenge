import { type ZodType, z } from "zod";

export interface VoyageWithUnitTypes {
  portOfLoading: string;
  portOfDischarge: string;
  vessel: string;
  departure: Date;
  arrival: Date;
  unitTypes: { id: string }[];
}

export const VoyageValidator: ZodType<VoyageWithUnitTypes> = z
  .object({
    portOfLoading: z.string(),
    portOfDischarge: z.string(),
    vessel: z.string(),
    departure: z.date(),
    arrival: z.date(),
    unitTypes: z
      .array(z.object({ id: z.string() }))
      .min(5, "Please select at least 5 unit types"),
  })
  .refine((data) => data.arrival > data.departure, {
    message: "Scheduled arrival must be after scheduled departure.",
    path: ["scheduledArrival"],
  });
