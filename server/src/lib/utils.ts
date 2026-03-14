import { z } from "zod";

const validateUuid = z.object({
  id: z.uuidv4("Invalid ID"),
});

export { validateUuid };
