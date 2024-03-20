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
// router.get('/quiz/:quizId/user/:userEmail/answer-details', async (req, res) => {
//   const quizId = req.params.quizId;
//   const userEmail = req.params.userEmail;
//   const userAnswerDetails = [];
//     //  const answerFrequencyByUsername = {};

//   try {
//     const quizData = await Quiz.findOne({ id: quizId });

//     if (!quizData) {
//       return res.status(404).json({ message: 'Quiz not found' });
//     }

//     //getUserAnswerDetails(quizData, userEmail);
//     try {       

//       // Find the user's answers
//       const userAnswers = quizData.user_answers.find(userAnswer => userAnswer.user.email === userEmail);

//       if (!userAnswers) {
//           console.log(`User '${userEmail}' not found.`);
//           return;
//       }
//       // Iterate through the user's answers
//       userAnswers.answers.forEach((answerIndex, questionIndex) => {
//           if (answerIndex >= 0 && answerIndex < quizData.questions.length) {
//               const question = quizData.questions[questionIndex];
//               const option = question.options[answerIndex];
//               const correctAnswerIndex = question.correct_answer;
//               const correctAnswer = question.options[correctAnswerIndex];

//               // Determine if the answer is correct
//               const isCorrect = answerIndex === correctAnswerIndex;

//               // Add answer details to the result array
//               userAnswerDetails.push({
//                   question: question.question_title,
//                   userAnswer: option,
//                   correctAnswer: correctAnswer,
//                   isCorrect: isCorrect
//               });
//           }
//       });

//       console.log(`User '${userEmail}' Answer Details:`, userAnswerDetails);
//   } catch (error) {
//       console.error('Error:', error.message);
//   }

//    return  res.json(userAnswerDetails);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// Route to get user answer details for a specific quiz and user email
router.get('/quiz/:quizId/user/:userEmail/answer-details', async (req, res) => {
  const quizId = req.params.quizId;
  const userEmail = req.params.userEmail;
  const userAnswerDetails = [];
    //  const answerFrequencyByUsername = {};

    try {
      const { quizId, emailId } = req.params;
      const quiz = await Quiz.findById(quizId);
  
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
  
      console.log(quiz);
      const userAnswers = quiz.user_answers.find(userAnswer => userAnswer.user.email === userEmail);
  
      if (!userAnswers) {
        return res.status(404).json({ message: 'User answers not found for the provided email ID' });
      }
  
      const userAnswerDetails = [];
      quiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers.answers[index];
        const correctAnswer = question.correct_answer;
        const isCorrect = userAnswer === correctAnswer;
        const option = question.options[userAnswer];
  
        userAnswerDetails.push({
          question: question.question_title,
          userAnswer: option,
          correctAnswer: question.options[correctAnswer],
          isCorrect
        });
      });
  
      res.json({ userAnswerDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



// Route to get total answer statistics for a specific quiz
// Route to fetch statistics for quiz answers
// router.get('/quiz/:quizId/answer-stats', async (req, res) => {
//   try {
//     const { quizId } = req.params;
//     const quiz = await Quiz.findById(quizId);

//     if (!quiz) {
//       return res.status(404).json({ message: 'Quiz not found' });
//     }

//     let totalCorrectAnswers = 0;
//     let totalWrongAnswers = 0;
//     let totalAnswers = 0;
//     const userStatistics = [];

//     // Iterate through each user answer
//     quiz.user_answers.forEach(userAnswer => {
//       let correctAnswers = 0;
//       let wrongAnswers = 0;

//       // Iterate through each question in the quiz
//       quiz.questions.forEach((question, index) => {
//         const userOption = userAnswer.answers[index];
//         const correctOptionIndex = question.correct_answer;

//         if (userOption === correctOptionIndex) {
//           correctAnswers++;
//         } else {
//           wrongAnswers++;
//         }
//       });

//       totalCorrectAnswers += correctAnswers;
//       totalWrongAnswers += wrongAnswers;
//       totalAnswers += userAnswer.answers.length;

//       userStatistics.push({
//         key: userAnswer.user.email,
//         question_type:quiz.questions[0].question_type,
//         correctAnswers,
//         wrongAnswers
//       });
//     });

//     const percentage = {
//       totalCorrectAnswers,
//       totalWrongAnswers,
//       totalAnswers
//     };

//     res.json({
//       result: userStatistics,
//       percentage
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// Route to fetch statistics for quiz answers
router.get('/quiz/:quizId/answer-stats', async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let totalCorrectAnswers = 0;
    let totalWrongAnswers = 0;
    let totalAnswers = 0;
    const userStatistics = [];

    if (quiz.questions[0].question_type === 'Poll') {
    const analytics = analyzeQuizResponses(quiz);
    res.json(analytics);
    }
    else{
    // Iterate through each user answer
    quiz.user_answers.forEach(userAnswer => {
      let correctAnswers = 0;
      let wrongAnswers = 0;

      // Iterate through each question in the quiz
      quiz.questions.forEach((question, index) => {
        const userOption = userAnswer.answers[index];
        const correctOptionIndex = question.correct_answer;

        if (userOption === correctOptionIndex) {
          correctAnswers++;
        } else {
          wrongAnswers++;
        }
      });

      totalCorrectAnswers += correctAnswers;
      totalWrongAnswers += wrongAnswers;
      totalAnswers += userAnswer.answers.length;

      userStatistics.push({
        key: userAnswer.user.email,
        question_type:quiz.questions[0].question_type,
        correctAnswers,
        wrongAnswers
      });
    });

    const percentage = {
      totalCorrectAnswers,
      totalWrongAnswers,
      totalAnswers
    };

    res.json({
      result: userStatistics,
      percentage
    });
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
  
});


// Function to analyze quiz responses
function analyzeQuizResponses(quiz) {
  const totalResponses = quiz.user_answers.length;
  const questionAnalytics = [];

  quiz.questions.forEach((question, index) => {
    const optionCounts = {};
    
    // Initialize optionCounts with 0 for each option
    question.options.forEach(option => {
      optionCounts[option] = 0;
    });

    quiz.user_answers.forEach(userAnswer => {
      const userResponse = userAnswer.answers[index];
      if (userResponse !== undefined) {
        const selectedOption = question.options[userResponse];
        optionCounts[selectedOption]++;
      }
    });

    // Convert optionCounts to array of objects with option and count
    const optionCountsArray = Object.entries(optionCounts).map(([option, count]) => ({
      option,
      count
    }));

    const optionPercentages = optionCountsArray.map(({ count }) => ((count / totalResponses) * 100).toFixed(2));

    questionAnalytics.push({
      questionTitle: question.question_title,
      totalResponses,
      optionCounts: optionCountsArray      
    });
  });

  return { question_type: 'Poll', analytics: questionAnalytics };
}
module.exports = router;
app.use("/api/analytics", router);
}