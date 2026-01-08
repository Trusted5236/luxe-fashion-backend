import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from 'dotenv'

dotenv.config()

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.Backend_URL}/api/authentication/google/callback`
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile)
    return done(null, profile)
  }
));