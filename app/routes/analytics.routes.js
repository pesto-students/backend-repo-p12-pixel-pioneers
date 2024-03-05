module.exports = app => {
    const express = require('express');
    const router = express.Router();
    const Quiz = require('../models/quiz.model');
    const User = require('../models/user.model');
    const UserAns = require('../models/quiz.model');
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

 // API endpoint to fetch answer frequency for each question, grouped by username
router.get('/answer-frequency-by-username', async (req, res) => {
    try {
      const quizzes = await Quiz.find().lean(); // Retrieve all quizzes from MongoDB
      const userAnswers = await UserAns.find().lean();
  
      const answerFrequencyByUsername = {};
  
      quizzes.forEach((quiz) => {
        quiz.user_answers.forEach((userAnswer) => {
          const username = userAnswer.user.name; // Assuming 'name' is used as the username field
          userAnswer.answers.forEach((answerIndex, index) => {
            const question = quiz.questions[index];
            const option = question.options[answerIndex];
            const isCorrectAnswer = answerIndex === question.correct_answer;
  
            answerFrequencyByUsername[username] = answerFrequencyByUsername[username] || {};
            answerFrequencyByUsername[username][question.question_title] = answerFrequencyByUsername[username][question.question_title] || { correct_answer: 0, wrong_answer: 0 };
  
            if (isCorrectAnswer) {
              answerFrequencyByUsername[username][question.question_title].correct_answer++;
            } else {
              answerFrequencyByUsername[username][question.question_title].wrong_answer++;
            }
          });
        });
      });
  
      res.json(answerFrequencyByUsername);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }); 

module.exports = router;
app.use("/api/analytics", router);
}