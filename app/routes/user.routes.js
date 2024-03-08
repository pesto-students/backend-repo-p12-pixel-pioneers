// module.exports = app => {
//     const user = require("../controllers/user.controller.js");
  
//     var router = require("express").Router();
  
//     // Create a new User
//     router.post("/", user.create);

//     // Retrieve all Users
//    router.get("/", user.findAll);

//    // Retrieve a single user with id
//    router.get("/:id", user.findOne);

//     // Update a User with id
//    router.put("/:id", user.update);

//   // Delete a User with id
//   router.delete("/:id", user.delete);

//   // Create a new User
//   router.delete("/", user.deleteAll);

//     app.use("/api/users", router);
// };  
module.exports = app => {
  const express = require('express'); 
  const router = express.Router();
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  const User = require('../models/user.model');
  
  
  router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      const newUser = new User({ email, password });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Registration failed' });
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
      const user = await User.findOne({ email });
  
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Update last_login field
      user.last_login = new Date();
      await user.save();
  
      const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
  
      // Additional user details to include in the response
      const userDetails = {
        id: user._id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        password: user.password,
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
  
  module.exports = router;
  app.use("/api/users", router);
  };  