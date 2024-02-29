// module.exports = mongoose => {
//     var schema = mongoose.Schema(
//       {
//         quiz_id: Number,
//         question:[{type:mongoose.Schema.Types.ObjectId,ref:'Question'}],
//         title:String,
//         validity:Date            
//       },
//       { timestamps: true }
//     );
  
//     schema.method("toJSON", function() {
//       const { __v, _id, ...object } = this.toObject();
//       object.id = _id;
//       return object;
//     });
  
//     const Quiz = mongoose.model("Quizes", schema);
//     return Quiz;
//   };

const mongoose = require('mongoose');


const quizSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Users',
    required: true
    //String
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
     required: true
    //String
  },
  persistQuestions: {
    type: Boolean,
    default: false
  },
  questions: {
    type: [{
    question_title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v.length >= 2 && v.length <= 4;
        },
        message: 'Options should have at least 2 and at most 4 values'
      }
    },
    correct_answer: {
      type: String      
    },
    question_type: {
      type: String,
      enum: ['mCQ', 'poll'],
      required: true
    }    
  }],
  validate: [validateQuestionsArray, 'Maximum number of questions exceeded']
}
});

function validateQuestionsArray(questions) {
  if (questions.length > 25) {
    return false;
  }
  return true;
}
const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
  