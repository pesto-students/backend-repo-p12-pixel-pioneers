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

// Route to get user answer details for a specific quiz and user email
router.get('/quiz/:quizId/user/:userEmail/answer-details', async (req, res) => {
  const quizId = req.params.quizId;
  const userEmail = req.params.userEmail;
  const userAnswerDetails = [];
    //  const answerFrequencyByUsername = {};

  try {
    const quizData = await Quiz.findOne({ id: quizId });

    if (!quizData) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    //getUserAnswerDetails(quizData, userEmail);
    try {
      

      // Find the user's answers
      const userAnswers = quizData.user_answers.find(userAnswer => userAnswer.user.email === userEmail);

      if (!userAnswers) {
          console.log(`User '${userEmail}' not found.`);
          return;
      }

      // Iterate through the user's answers
      userAnswers.answers.forEach((answerIndex, questionIndex) => {
          if (answerIndex >= 0 && answerIndex < quizData.questions.length) {
              const question = quizData.questions[questionIndex];
              const option = question.options[answerIndex];
              const correctAnswerIndex = question.correct_answer;
              const correctAnswer = question.options[correctAnswerIndex];

              // Determine if the answer is correct
              const isCorrect = answerIndex === correctAnswerIndex;

              // Add answer details to the result array
              userAnswerDetails.push({
                  question: question.question_title,
                  optionChosen: option,
                  correctAnswer: correctAnswer,
                  isCorrect: isCorrect
              });
          }
      });

      console.log(`User '${userEmail}' Answer Details:`, userAnswerDetails);
  } catch (error) {
      console.error('Error:', error.message);
  }

    res.json(userAnswerDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to get total answer statistics for a specific quiz
router.get('/quiz/:quizId/answer-stats', async (req, res) => {
  const quizId = req.params.quizId;
  let totalCorrectAnswers = 0;
  let totalWrongAnswers = 0;
  let totalAnswers = 0;

  try {
    const quizData = await Quiz.findOne({ id: quizId });

    if (!quizData) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    try {
     
      // Iterate through user answers
      quizData.user_answers.forEach(userAnswer => {
          userAnswer.answers.forEach((answerIndex, questionIndex) => {
              if (answerIndex >= 0 && answerIndex < quizData.questions.length) {
                  const correctAnswerIndex = quizData.questions[questionIndex].correct_answer;
                  if (answerIndex === correctAnswerIndex) {
                      totalCorrectAnswers++;
                  } else {
                      totalWrongAnswers++;
                  }
                  totalAnswers++;
              }
          });
      });

      console.log('Total Correct Answers:', totalCorrectAnswers);
      console.log('Total Wrong Answers:', totalWrongAnswers);
      console.log('Total Answers:', totalAnswers);
  } catch (error) {
      console.error('Error:', error.message);
  }
  res.json({
      quizId,
      totalCorrectAnswers,
      totalWrongAnswers,
      totalAnswers
    });
    //res.json({ message: 'Total answer statistics calculated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
app.use("/api/analytics", router);
}