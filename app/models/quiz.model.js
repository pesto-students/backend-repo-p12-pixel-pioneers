module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      quiz_id: Number,
      question:[{type:mongoose.Schema.Types.ObjectId,ref:'Question'}],
      title:String,
      validity:Date            
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
