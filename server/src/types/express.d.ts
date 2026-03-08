import type { AdminSelectType } from "../db/schema.ts";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminSelectType;
    }
  }
}
