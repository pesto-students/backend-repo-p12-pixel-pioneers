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
  const User = require('../models/user.model');
  
  
  const validateUserExists = async (req, res, next) => {
    const { createdBy } = req.body;
  
    try {
      const user = await User.findById(createdBy);
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking user' });
    }
  };
  
  router.post('/', validateUserExists,async (req, res) => {
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
    // try {
    //   const query = {}; // Add any filtering criteria here if needed
    //   const result = await Quiz.find(query, { title: 1, _id: 1,"questions.correct_answer": 0 })    
    //   res.json(result);
    // } catch (err) {
    //   console.log(err);
    //   res.status(500).json({ msg: "Server Error" });
    // }
    try {
      const query = {}; // Add any filtering criteria here if needed
      const result = await Quiz.aggregate([
        { $match: query },
        {
          $project: {
             title: 1,
            _id: 1,
            questions: {
              $map: {
                input: "$questions",
                as: "question",
                in: {
                  question_title: "$$question.question_title",
                  options: "$$question.options",
                  question_type: "$$question.question_type"
                }
              }
            }
          }
        }
      ]);
  
      res.json(result);
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Server Error" });
    }
  });
  
  router.put("/:id",validateUserExists, async (req, res) => {
    // try {
    //   const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("createdBy").populate("lastUpdatedBy");
    //   if (!updatedQuiz) throw new Error("No quiz found.");
    //   res.json(updatedQuiz);
    // } catch (err) {
    //   if (err.name === "CastError") {
    //     res.status(400).json({ msg: "Invalid ID." });
    //   } else if (err.message === "No quiz found.") {
    //     res.status(404).json({ msg: "Quiz not found." });
    //   } else {
    //     console.log(err);
    //     res.status(500).json({ msg: "Server Error" });
    //   }
    // }
    try {
      const updatedQuiz = await Quiz.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      );
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
  
  router.patch("/:id",validateUserExists, async (req, res) => {
    // try {
    //   const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).populate("createdBy").populate("lastUpdatedBy");
    //   if (!updatedQuiz) throw new Error("No quiz found.");
    //   res.json(updatedQuiz);
    // } catch (err) {
    //   if (err.name === "CastError") {
    //     res.status(400).json({ msg: "Invalid ID." });
    //   } else if (err.message === "No quiz found.") {
    //     res.status(404).json({ msg: "Quiz not found." });
    //   } else {
    //     console.log(err);
    //     res.status(500).json({ msg: "Server Error" });
    //   }
    // }
    try {
      const updatedQuiz = await Quiz.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true }
      ).populate("createdBy").populate("lastUpdatedBy");
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
    // try {
    //   const quiz = await Quiz.findById(req.params.id).populate("createdBy").populate("lastUpdatedBy");
    //   if (!quiz) throw new Error("No quiz found.");
    //   res.json(quiz);
    // } catch (err) {
    //   if (err.name === "CastError") {
    //     res.status(400).json({ msg: "Invalid ID." });
    //   } else if (err.message === "No quiz found.") {
    //     res.status(404).json({ msg: "Quiz not found." });
    //   } else {
    //     console.log(err);
    //     res.status(500).json({ msg: "Server Error" });
    //   }
    // }
    try {
      const quiz = await Quiz.findOne({ id: req.params.id });
      if (!quiz) throw new Error("No quiz found.");
      res.json(quiz);
    } catch (err) {
      if (err.message === "No quiz found.") {
        res.status(404).json({ msg: "Quiz not found." });
      } else {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
      }
    }
  });
  
  // API endpoint to fetch answer frequency for each question
  router.get('/answer-frequency', async (req, res) => {
    try {
      const quizzes = await Quiz.find().lean(); // Retrieve all quizzes from MongoDB
      const answerFrequency = [];
  
      quizzes.forEach((quiz) => {
        quiz.questions.forEach((question) => {
          const questionData = {
            question: question.question_title,
            analytics: []
          };
  
          // Calculate answer frequency for each option in the question
          question.options.forEach((option, index) => {
            const optionData = {
              option: option,
              frequency: quiz.user_answers.filter((answer) => answer.answers.includes(index)).length,
              correct_answer: index === question.correct_answer
            };
            questionData.analytics.push(optionData);
          });
  
          answerFrequency.push(questionData);
        });
      });
  
      res.json(answerFrequency);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  
  module.exports = router;
  app.use("/api/quizs", router);
  }