import jwt from "jsonwebtoken";
import type { UserSelectType } from "../db/schema.js";

const secretKey = process.env.JWT_SECRET_KEY!;

const setUser = (user: UserSelectType, expiresIn?: number) => {
  const token = jwt.sign(
    {
      id: user.userId,
      email: user.email,
      societyId: user.societyId,
    },
    secretKey,
    { expiresIn: expiresIn || 2 * 7 * 24 * 60 * 60 * 1000 },
  );
  return token;
};

const verifyUser = (token: string) => {
  try {
    const result = jwt.verify(token, secretKey);
    return {
      //@ts-ignore
      userId: result.id,
      //@ts-ignore
      email: result.email,
      //@ts-ignore
      societyId: result.societyId,
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      userId: undefined,
      email: undefined,
      societyId: undefined,
    };
  }
};

export { setUser, verifyUser };
