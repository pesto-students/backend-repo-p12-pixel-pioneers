module.exports = app => {
    const express = require('express');
    const router = express.Router();
    
    const User = require('../models/user.model');
    const QuestionBank = require('../models/questionBank.model');
    
    
     // API Endpoint for Searching Questions
    // Search questions by title
    router.get('/search', async (req, res) => {
        const searchWord = req.query.q; // Search query parameter
        //const searchWord1 = req.params.q;
        console.log(searchWord);
        //console.log(searchWord1);
        try {
          // Find questions with the given word in the title
          const questions = await QuestionBank.find({
            question_title: { $regex: searchWord, $options: 'i' }, // Case-insensitive search
          }).select('-createdBy -lastUpdatedBy'); // Exclude createdBy and lastUpdatedBy
      
          res.json(questions);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Internal server error' });
        }
    });
       
        router.get('/:userId', async (req, res) => {
            const userId = req.params.userId;
        
            try {
                const userQuestions = await QuestionBank.find({ createdBy: userId });
                res.status(200).json(userQuestions);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
      
       
    
    module.exports = router;
    app.use("/api/questionBank", router);
    }