import z from "zod";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { setUser } from "../lib/user-auth.js";
import type { Request, Response } from "express";
import {
  societiesTable,
  type UserSelectType,
  usersTable,
} from "../db/schema.js";

async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    console.log("Request received at /api/society/" + societyId + "/users");

    console.log("Society Id", societyId);

    const usersResult = await db.execute<UserSelectType>(sql`
      select
        u.user_id as "userId",
        u.name as "name",
        u.email as "email",
        u.password as "password",
        u.society_id as "societyId",
        u.created_at as "createdAt",
        u.updated_at as "updatedAt"
      from users u
      where u.society_id = ${societyId}
    `);

    const users = usersResult.rows;

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

async function loginUserHandler(req: Request, res: Response) {
  try {
    const { societyId } = req.society;
    const body = req.body;
    console.log(`Request received at /api/society/${societyId}/users/sign-in`);

    const validationResult = z
      .object({
        email: z.email(),
        password: z.string().min(6),
      })
      .safeParse(body);

    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.message, success: false });
    }

    const { email, password } = validationResult.data;

    const userResult = await db.execute<UserSelectType>(sql`
      select
        u.user_id as "userId",
        u.name as "name",
        u.email as "email",
        u.password as "password",
        u.society_id as "societyId",
        u.created_at as "createdAt",
        u.updated_at as "updatedAt"
      from users u
      where u.email = ${email} and u.society_id = ${societyId}
    `);

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found", success: false });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Invalid credentials", success: false });
    }

    const token = setUser(user);

    const societyResult = await db.execute(sql`
      select
        s.society_id as "societyId",
        s.name as "name",
        s.address as "address",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt"
      from ${societiesTable} s
      where s.society_id = ${user.societyId}
     `);

    const society = societyResult.rows[0];

    res.cookie("resident-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user,
      society,
      success: true,
    });
  } catch (error) {
    console.error("USER[LOGIN][POST]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function getUserHandler(req: Request, res: Response) {
  try {
    const user = req.user as UserSelectType;

    if (!user) {
      return res.status(404).json({ error: "User not found", success: false });
    }

    // console.log(user);

    const societyResult = await db.execute(sql`
      select
        s.society_id as "societyId",
        s.name as "name",
        s.address as "address",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt"
      from ${societiesTable} s
      where s.society_id = ${user.societyId}
     `);

    const society = societyResult.rows[0];

    return res.status(200).json({
      user,
      society,
      message: "User found successfully",
      success: true,
    });
  } catch (error) {
    console.error("USER[GET][GET]:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong", success: false });
  }
}

async function logoutUserHandler(req: Request, res: Response) {
  try {
    const user = req.user as UserSelectType;

    const userAuthToken = setUser(user, 0);

    // console.log("Resident Token:", userAuthToken);

    res.cookie("resident-auth-token", userAuthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      maxAge: 0,
    });

    return res.status(200).json({
      message: "User logout successfully",
      success: true,
    });
  } catch (error) {
    console.error("USER[LOGOUT][GET]:", error);
    return res.status(500).json({
      error: "Something went wrong",
      success: false,
    });
  }
}

export {
  getUserHandler,
  loginUserHandler,
  createUserHandler,
  getAllUsersHandler,
  logoutUserHandler,
};
