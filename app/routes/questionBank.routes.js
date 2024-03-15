module.exports = app => {
const express = require('express');
const router = express.Router();

const User = require('../models/user.model');
const QuestionBank = require('../models/questionBank.model');
   
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