import express from "express";
const router = express.Router()
import passport from "passport";
import User from "../models/userSchema.js";
import jwt from 'jsonwebtoken'

const handleOauthUser = async (profile, providerId)=>{
    let user = await User.findOne({$or: [{[providerId] : profile.id}, {email : profile.emails[0].value}]})

    if(user){
        if (!user[providerId]) {
                user[providerId] = profile.id;
                await user.save();
                console.log('✅ Linked Google account to existing user');
            } else {
                console.log('✅ User already has Google linked');
            }
    }else {
        user = new User({
            name : profile.displayName,
            email : profile.emails[0].value,
            [providerId] : profile.id
        })

        await user.save()
    }
    const token = jwt.sign({id: user._id, name: user.name, role : user.role, email : user.email}, process.env.JWT_KEY, {expiresIn : "2h"})
    return token
}

router.get('/google',
  passport.authenticate('google', {scope : ["email", "profile"]})
);


router.get('/google/callback',
  passport.authenticate('google', {session : false, failureRedirect : `${process.env.Frontend_URL}/auth`}), 
  async (req, res)=>{
    try {
      console.log('✅ Google callback reached');
      console.log('Profile:', req.user);
      
      const profile = req.user;
      const token = await handleOauthUser(profile, "googleId");
      
      console.log('✅ Token generated:', token);
      console.log('🔄 Redirecting to:', `${process.env.Frontend_URL}/?token=${token}`);
      
      res.redirect(`${process.env.Frontend_URL}/?token=${token}`);
    } catch (error) {
      console.error('❌ Error in callback:', error);
      res.redirect(`${process.env.Frontend_URL}/auth?error=oauth_failed`);
    }
  }
);

export default router