import passport from "passport";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { adminsTable } from "../db/schema.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
      },
      async function (accessToken, refreshToken, profile, done) {
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);
        console.log("User:", profile);
        try {
          const email = profile._json.email!;

          const [existingAdmin] = await db
            .select()
            .from(adminsTable)
            .where(eq(adminsTable.email, email));

          if (existingAdmin) {
            return done(null, existingAdmin);
          }

          const [admin] = await db
            .insert(adminsTable)
            .values({
              name: profile._json.name!,
              email: email,
            })
            .returning();

          console.log("Admin:", admin);

          done(null, admin);
        } catch (error) {
          console.error("Error creating user or account:", error);
          done(error, false);
        }
      },
    ),
  );
}

// passport.serializeUser((user: any, callback) => {
//   callback(null, user.adminId);
// });

// passport.deserializeUser(async (id: string, callback) => {
//   try {
//     const [admin] = await db
//       .select()
//       .from(adminsTable)
//       .where(eq(adminsTable.adminId, id));

//     callback(null, admin);
//   } catch (error) {
//     callback(error, null);
//   }
// });

export { configurePassport };
