import type {
  AdminSelectType,
  SocietySelectType,
  UserSelectType,
} from "../db/schema.ts";

declare global {
  namespace Express {
    interface Request {
      user: UserSelectType;
      admin?: AdminSelectType;
      society: SocietySelectType;
    }
  }
}
