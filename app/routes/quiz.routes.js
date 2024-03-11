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
  const axios = require('axios');
  const jwt = require('jsonwebtoken');
  
  
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
  
  router.post('/', async (req, res) => {
  
    const token = req.headers.authorization.split(' ')[1]; // Extract JWT token from Authorization header
  
      jwt.verify(token, 'secret_key', (err, decoded) => {
          if (err) {
              return res.status(401).json({ message: 'Invalid token' });
          } 
          const userId = decoded.userId;       
          const newQuiz = new Quiz({
            title: req.body.title,
            status: req.body.status,
            createdBy: userId,
            lastUpdatedBy: userId,
            validity: req.body.validity,
            questions: req.body.questions,
            user_answers: []
        });
          newQuiz.save()
          .then((quiz) => {
              res.status(201).json(quiz);
          })
          .catch((error) => {
              res.status(400).json({ message: error.message });
          });
  });
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
  
  router.get("/questions", async (req, res) => {
    try {
      const query = {}; // Add any filtering criteria here if needed
      const result = await Quiz.find(query, {id:1,title: 1, _id: 1,questions: 1 })    
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
    // try {
    //   const updatedQuiz = await Quiz.findOneAndUpdate(
    //     { id: req.params.id },
    //     req.body,
    //     { new: true }
    //   );
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
    // try {
    //   const updatedQuiz = await Quiz.findOneAndUpdate(
    //     { id: req.params.id },
    //     { $set: req.body },
    //     { new: true }
    //   ).populate("createdBy").populate("lastUpdatedBy");
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
  });
  
  // Add a user to user_answers for a quiz
  router.post('/:quizId/user_answers', async (req, res) => {
    const { name, age, gender, email, city, answers } = req.body;
    const { quizId } = req.params;
  
    try {
      const quiz = await Quiz.findById(quizId);
  
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
  
      const newUserAnswer = {
        user: { name, age, gender, email, city },
        answers
      };
  
      quiz.user_answers.push(newUserAnswer);
      await quiz.save();
  
      res.json({ message: 'User added to user_answers successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
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
    // try {
    //   const quiz = await Quiz.findById({ id: req.params.id });
    //   if (!quiz) throw new Error("No quiz found.");
    //   res.json(quiz);
    // } catch (err) {
    //   if (err.message === "No quiz found.") {
    //     res.status(404).json({ msg: "Quiz not found." });
    //   } else {
    //     console.log(err);
    //     res.status(500).json({ msg: "Server Error" });
    //   }
    // }
  });
  router.get('/excludeAns/:id', async (req, res) => {
    const quizId = req.params.id;
  
    try {
      const quiz = await Quiz.findById(quizId, { 'questions.correct_answer': 0 }).lean();
  
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
  
      res.status(200).json(quiz);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching quiz' });
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
  
  // API endpoint to fetch all quizzes created by a specific user
  router.get('/quizzes/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
        const quizzes = await Quiz.find({ createdBy: userId });
  
        if (!quizzes) {
            return res.status(404).json({ message: 'No quizzes found for this user' });
        }
  
        res.status(200).json({ quizzes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  module.exports = router;
  app.use("/api/quizs", router);
  }