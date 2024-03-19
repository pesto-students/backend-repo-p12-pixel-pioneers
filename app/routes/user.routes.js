module.exports = app => {
  const express = require('express'); 
  const router = express.Router();
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  const User = require('../models/user.model');
  //const emailValidator = require('email-deep-validator');
  const crypto = require('crypto');
  const nodemailer = require('nodemailer');
  const ForgotPassword = require('../models/forgotPassword.model'); 
  //import emailValidator from "deep-email-validator";
  
  
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };
  
  const validatePassword = (password) => {
    // Regular expression to match password criteria
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return re.test(password);
  };
  
  router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(406).json({ message: 'Email and password are required fields' });
      }
  
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }
      if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Please provide a valid password' });
      }
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered, please use a different email' });
      }
  
      const newUser = new User({ email, password });
      await newUser.save();
  
      const token = jwt.sign({ userId: newUser._id }, 'secret_key', { expiresIn: '1m' });
      //await Session.create({ email, accessToken: token });
  
      // Additional user details to include in the response
      const userDetails = {
        _id: newUser._id,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        };
  
      res.json({
        msg: 'User registered successfully!',
        token,
        newUser: userDetails
      });
  
      //res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  });
  // router.post('/login', async (req, res) => {
  //   try {
  //     const { email, password } = req.body;
  //     const user = await User.findOne({ email });
  
  //     if (!user || !bcrypt.compareSync(password, user.password)) {
  //       return res.status(401).json({ message: 'Invalid credentials' });
  //     }
  
  //     const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
  //     res.json({ token });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Login failed' });
  //   }
  // });
  
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(406).json({ message: 'Email and password are required fields' });
      }
  
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }
      
      // const isActiveUser = await Session.findOne({ email });
      // if (isActiveUser) {
      //   return res.status(400).json({ message: 'You are already logged in, kindly continue with the session!' });
      // }
  
      const user = await User.findOne({ email });    
      if (!user) {      
        return res.status(400).json({ message: 'User is not registered!' });
      }
  
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Update last_login field
      user.last_login = new Date();
      await user.save();
  
      const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1m' });
      //await Session.create({ email, accessToken: token });
  
      // Additional user details to include in the response
      const userDetails = {
        _id: user._id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        last_login: user.last_login
      };
  
      res.json({
        msg: 'Logged in!',
        token,
        user: userDetails
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  
  });
  
  // router.post('/forgot-password', async (req, res) => {
  //   const { email } = req.body;
  
  //   try {
  //     // Generate a random token
  //     const token = crypto.randomBytes(20).toString("hex");
  
  //     // Create a password reset link
  //     const resetLink = `https://quizzify.netlify.app/reset-password/${token}`;
  
  //     // Send an email with the reset link
  //     const transporter = nodemailer.createTransport({
  //       host: "smtp.gmail.com",
  //       port: 587,
  //       secure: false,
  //       auth: {
  //         user: "quizzify.service@gmail.com",
  //         pass: "pwfs oklw nhtf nnmz",
  //       },
  //     });
  
  //     const mailOptions = {
  //       from: ' "Quizzify" <quizzify.service@gmail.com>',
  //       to: email,
  //       subject: "Password Reset",
  //       html: `<p>You have requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  //     };
  
  //     transporter.sendMail(mailOptions, async (error, info) => {
  //       if (error) {
  //         console.log(error);
  //         return res.status(500).json({ message: "Error sending email" });
  //       } else {
  //         try {
  //           // Store the token with the user's email in MongoDB
  //           await ForgotPassword.create({ email, token });
  //           console.log("Email sent: " + info.response);
  //           return res.status(200).json({ message: "Password reset email sent" });
  //         } catch (error) {
  //           console.error(error);
  //           return res.status(500).json({ message: "Error storing password reset token" });
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: "Error generating password reset token" });
  //   }
  // });
  
  // router.post('/reset-password/:token', async (req, res) => {
  //   const { token } = req.params;
  //   const { newPassword } = req.body;
  //   const hashedNewPassword = await bcrypt.hash(newPassword, 8);
  
  //   try {
  //     // Find the token in MongoDB
  //     const tokenDocument = await ForgotPassword.findOne({ token });
  
  //     if (!tokenDocument) {
  //       return res.status(400).json({ message: "Invalid or expired token" });
  //     }
  
  //     let updatedUser;
  //     if (await User.exists({ email: tokenDocument.email })) {
  //       updatedUser = await User.findOneAndUpdate(
  //         { email: tokenDocument.email },
  //         { password: hashedNewPassword }
  //       );
  //     } 
  
  //     // Delete the token from MongoDB after password reset
  //     await ForgotPassword.deleteOne({ token });
  
  //     if (updatedUser) {
  //       return res.status(200).json({ message: "Password reset successfully" });
  //     } else {
  //       return res.status(400).json({ message: "User not found or email not associated with any collection" });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: "Error resetting password" });
  //   }
  // });
  
  // Change password
  router.put('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the old password matches
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
  
      // Hash the new password
     // const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      user.password = newPassword;
      await user.save();
  
      // Generate a new JWT token with the updated user information
      const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
  
      // Additional user details to include in the response
      const userDetails = {
        id: user._id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        last_login: user.last_login
      };
  
      res.json({
        message: 'Password changed successfully',
        token,
        user: userDetails
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  // Update user name
  router.put('/update-name', async (req, res) => {
    const { email, newName } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's name
      user.name = newName;
      await user.save();
  
      // Return the updated user
      res.json({ message: 'User name updated successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  module.exports = router;
  app.use("/api/users", router);
  };  