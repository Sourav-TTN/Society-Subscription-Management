import jwt from "jsonwebtoken";
import type { AdminsSelectType } from "../db/schema.js";

const secretKey = process.env.JWT_SECRET_KEY!;

const setAdmin = (admin: AdminsSelectType) => {
  const token = jwt.sign(
    {
      id: admin.adminId,
      email: admin.email,
    },
    secretKey,
    { expiresIn: 2 * 7 * 24 * 60 * 60 * 1000 },
  );

  return token;
};

const verifyAdmin = (token: string) => {
  try {
    const result = jwt.verify(token, secretKey);
    //@ts-ignore
    return { adminId: result.id, email: result.email, success: true };
  } catch (error) {
    return { success: false, adminId: undefined, email: undefined };
  }
};

export { setAdmin, verifyAdmin };
