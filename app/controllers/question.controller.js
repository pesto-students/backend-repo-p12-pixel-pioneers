const db = require("../models");
const Question = db.questions;

// Create and Save a new User
exports.create = (req, res) => {
    //Validate request
    // if (!req.body.question_id) {
    //   res.status(400).send({ message: "Question can not be empty!" });
    //   return;
    // }
  
    // Create a User
    let options = [];
    // options.push({
    //     option1: req.body.option1,
    //     option2: req.body.option2,
    //     option3: req.body.option3,
    //     option4: req.body.option4
    //   })
    const question = new Question({      
      question_type:req.body.question_type, 
      question_id:req.body.question_id,
      question:req.body.question,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer  
    });
  // Save User in the database
  question
    .save(question)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the user."
      });
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const id = req.question.id;
  var condition = id ? { id: { $regex: new RegExp(id), $options: "i" } } : {};

  Question.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving questions."
      });
    });
};

// Find a single user with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Question.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found User with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving User with id=" + id });
    });
};
// Update a User by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;
  //var update = JSON.parse(req.body);
  Question.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Question with id=${id}. Maybe Question was not found!`
        });
      } else
      
      res.send({ message: "Question was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Question with id=" + id
      });
    });
};


// // Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Question.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      } else {
        res.send({
          message: "User was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id
      });
    });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
    Question.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Question were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
    Question.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};
