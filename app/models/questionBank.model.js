const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
    question_title: { type: String, minlength: 2, maxlength: 100 },
    options: [{ type: String }],
    correct_answer: { type: Number },
    question_type: { type: String, enum: ['MCQ', 'poll'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

questionBankSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

module.exports = QuestionBank;