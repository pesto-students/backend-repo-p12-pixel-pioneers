module.exports = app => {
    const quiz = require("../controllers/quiz.controller.js");
  
    var router = require("express").Router();
  
    // Create a new User
    router.post("/", quiz.create);

    // Retrieve all Users
   router.get("/", quiz.findAll);

   // Retrieve a single user with id
   router.get("/:id", quiz.findOne);

    // Update a User with id
   router.put("/:id", quiz.update);

  // Delete a User with id
  router.delete("/:id", quiz.delete);

  // Create a new User
  router.delete("/", quiz.deleteAll);

    app.use("/api/quizs", router);
};  