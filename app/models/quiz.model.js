const mongoose = require('mongoose');

const UserAnsSchema = new mongoose.Schema({
  name: { type: String, required: false },
  age: { type: Number, required: false },
  gender: { type: String, required: false },
  email: { type: String, required: false },
  city: { type: String, required: false }
});

const quizSchema = new mongoose.Schema({
  //id: { type: String, required: false },
  title: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], required: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  //persistQuestions: { type: Boolean, default: false },
  validity: { type: Date },
  questions : [{
    question_title : { type:String, minlength : 2, maxlength : 100 },
    options : [{ type:String }],
    correct_answer : { type:Number },
    question_type : { type:String, enum:['MCQ', 'poll'] },
    persistQuestions: { type: Boolean, default: false }
  }],
  user_answers : [{
    user : UserAnsSchema,
    answers : [{ type:Number }]
  }]
});

const Quiz = mongoose.model('Quiz', quizSchema);
const UserAns = mongoose.model('UserAnswers', UserAnsSchema);

module.exports = UserAns;
module.exports = Quiz;
