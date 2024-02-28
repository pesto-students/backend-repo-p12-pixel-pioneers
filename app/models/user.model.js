// module.exports = mongoose => {
//     var schema = mongoose.Schema(
//       {
//         name: String,
//         role: String,
//         password: String
//       },
//       { timestamps: true }
//     );
  
//     schema.method("toJSON", function() {
//       const { __v, _id, ...object } = this.toObject();
//       object.id = _id;
//       return object;
//     });
  
//     const User = mongoose.model("Users", schema);
//     return User;
//   };
  

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
