module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        quiz_id: String,
        // question:{
        //     metadata :{
        //         id:String,
        //         name:String,
        //         questn_text:String,
        //         options:[{A:String,B:String,C:String,D:String}],
        //         correct_answer:String,
        //         type:String
        //     }
        // },
        url: String        
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Quiz = mongoose.model("Quizes", schema);
    return Quiz;
  };
  