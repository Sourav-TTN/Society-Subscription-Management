import z from "zod";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    console.log("Request received at /api/society/" + societyId + "/users");

    console.log("Society Id", societyId);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.societyId, societyId));

    return res
      .status(200)
      .json({ message: "All users found successfully", users, success: true });
  } catch (error) {
    console.error("USERS[ALL][GET]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function createUserHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    console.log(
      "Request received at /api/society/" + societyId + "/users/sign-up",
    );

    const body = req.body;

    const validationResult = z
      .object({
        name: z.string().min(1),
        email: z.email(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
      .safeParse(body);

    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.message, success: false });
    }

    const { name, email, password } = validationResult.data;

    const salt = bcrypt.genSaltSync(6);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const [user] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
        societyId,
      })
      .returning();

    if (!user) {
      return res
        .status(500)
        .json({ error: "Unable to create user for now.", success: false });
    }

    return res
      .status(201)
      .json({ message: "User created successfully", user, success: false });
  } catch (error) {
    console.error("USER[CREATE][POST]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

export { getAllUsersHandler, createUserHandler };
