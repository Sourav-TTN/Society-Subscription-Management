import type { AdminSelectType, SocietySelectType } from "../db/schema.ts";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminSelectType;
      society: SocietySelectType;
    }
  }
}
