import type { AdminsSelectType } from "../db/schema.ts";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminsSelectType;
    }
  }
}
