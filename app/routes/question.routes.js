module.exports = app => {
    const question = require("../controllers/question.controller.js");
  
    var router = require("express").Router();
  
    // Create a new User
    router.post("/", question.create);

    // Retrieve all Users
   //router.get("/", question.findAll);

   // Retrieve a single user with id
   router.get("/:id", question.findOne);

    // Update a User with id
   router.put("/:id", question.update);

  // Delete a User with id
  router.delete("/:id", question.delete);

  // Create a new User
  router.delete("/", question.deleteAll);

    app.use("/api/questions", router);
};  