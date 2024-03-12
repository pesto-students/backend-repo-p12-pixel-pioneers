module.exports = {
  //url: "mongodb+srv://varalakshmidchinthakunta:jy2M1EtgEy0BTTUr@cluster0.5vqqwmf.mongodb.net/quizzify?retryWrites=true&w=majority"

  url: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.5vqqwmf.mongodb.net/quizzify?retryWrites=true&w=majority`
};
