// module.exports = app => {
//     const quiz = require("../controllers/quiz.controller.js");
  
//     var router = require("express").Router();
  
//     // Create a new User
//     router.post("/", quiz.create);

//     // Retrieve all Users
//    router.get("/", quiz.findAll);

//    // Retrieve a single user with id
//    router.get("/:id", quiz.findOne);

//     // Update a User with id
//    router.put("/:id", quiz.update);

//   // Delete a User with id
//   router.delete("/:id", quiz.delete);

//   // Create a new User
//   router.delete("/", quiz.deleteAll);

//     app.use("/api/quizs", router);
// };  

module.exports = app => {
  const express = require('express');
  const router = express.Router();
  const Quiz = require('../models/quiz.model');
  
  router.post('/', async (req, res) => {
    try {
      const quiz = new Quiz(req.body);
      await quiz.save();
      res.status(201).send(quiz);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Get all quizzes
  router.get("/", async (req, res) => {
    try {
      const query = {}; // Add any filtering criteria here if needed
      const result = await Quiz.find(query).populate("createdBy").populate("lastUpdatedBy");
      res.json(result);
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Server Error" });
    }
  });
  
  router.put("/:id", async (req, res) => {
    try {
      const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("createdBy").populate("lastUpdatedBy");
      if (!updatedQuiz) throw new Error("No quiz found.");
      res.json(updatedQuiz);
    } catch (err) {
      if (err.name === "CastError") {
        res.status(400).json({ msg: "Invalid ID." });
      } else if (err.message === "No quiz found.") {
        res.status(404).json({ msg: "Quiz not found." });
      } else {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
      }
    }
  });
  
  router.patch("/:id", async (req, res) => {
    try {
      const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).populate("createdBy").populate("lastUpdatedBy");
      if (!updatedQuiz) throw new Error("No quiz found.");
      res.json(updatedQuiz);
    } catch (err) {
      if (err.name === "CastError") {
        res.status(400).json({ msg: "Invalid ID." });
      } else if (err.message === "No quiz found.") {
        res.status(404).json({ msg: "Quiz not found." });
      } else {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
      }
    }
  });
  
  router.get("/:id", async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id).populate("createdBy").populate("lastUpdatedBy");
      if (!quiz) throw new Error("No quiz found.");
      res.json(quiz);
    } catch (err) {
      if (err.name === "CastError") {
        res.status(400).json({ msg: "Invalid ID." });
      } else if (err.message === "No quiz found.") {
        res.status(404).json({ msg: "Quiz not found." });
      } else {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
      }
    }
  });
  module.exports = router;
  app.use("/api/quizs", router);
  }