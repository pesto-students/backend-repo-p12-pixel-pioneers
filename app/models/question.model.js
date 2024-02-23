module.exports = mongoose => {
    var schema  = mongoose.Schema(
      {
        question_id: String,
        question:String,
        question_type:String,
        options: [String],
        correctAnswer:String           
      },
      
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Question = mongoose.model("Questions", schema);
    return Question;
  };
  