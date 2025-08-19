import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import { UserCredentialsRepository } from "@/contexts/auth/domain/repositories/user-credentials-repository";

export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export function configurePassport(
  userCredentialsRepository: UserCredentialsRepository,
  userRepository?: any, // Optional user repository for fetching user details
): void {
  const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

  // JWT Strategy
  const jwtStrategy = new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    },
    async (payload: JwtPayload, done) => {
      try {
        // Find user credentials by userId
        const userCredentials = await userCredentialsRepository.findByUserId(
          payload.userId,
        );

        if (!userCredentials) {
          done(null, false, { message: "User not found" });
          return;
        }

        // Check if user is active
        if (!userCredentials.isUserActive()) {
          done(null, false, { message: "User account is deactivated" });
          return;
        }

        // Return user info
        const user = {
          userId: userCredentials.getUserId(),
          email: userCredentials.getEmail().getValue(),
        };

        done(null, user);
        return;
      } catch (error) {
        done(error, false);
        return;
      }
    },
  );

  passport.use(jwtStrategy);

  // Serialize user (not needed for JWT, but required by Passport)
  passport.serializeUser((user: any, done) => {
    done(null, user.userId);
  });

  // Deserialize user (not needed for JWT, but required by Passport)
  passport.deserializeUser(async (userId: string, done) => {
    try {
      // Fetch user details from user repository if available
      if (userRepository) {
        const user = await userRepository.findById(userId);
        if (user) {
          done(null, { userId: user.id, email: user.email });
          return;
        }
      }

      // Fallback: fetch from credentials repository
      const userCredentials =
        await userCredentialsRepository.findByUserId(userId);
      if (userCredentials) {
        done(null, {
          userId: userCredentials.getUserId(),
          email: userCredentials.getEmail().getValue(),
        });
        return;
      }

      done(null, false);
    } catch (error) {
      done(error, null);
    }
  });
}
