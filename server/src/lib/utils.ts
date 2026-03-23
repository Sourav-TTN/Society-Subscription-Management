import { z } from "zod";

const validateUuid = z.object({
  id: z.uuidv4("Invalid ID"),
});

function getLastDateOfPreviousMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 0);
}

export { validateUuid, getLastDateOfPreviousMonth };
