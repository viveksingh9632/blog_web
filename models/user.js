const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const { createTokenForUser } = require('../services/auth'); // Adjust the path as necessary
const crypto = require('crypto'); // Add this line to import the crypto module

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  salt: { type: String,   },

  password: { type: String, required: true },
  
  profileImage: {
    type: String,
    default: "/images/download.png",
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },

  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  const salt = crypto.randomBytes(16).toString('hex'); // Add 'hex' encoding
  const hashpassword = crypto.createHmac('sha256', salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashpassword;

  next();
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('User not found!');

  const salt = user.salt;
  const hashPassword = user.password;

  const userProvidedHash = crypto.createHmac('sha256', salt)
      .update(password)
      .digest("hex");

  if (hashPassword !== userProvidedHash) throw new Error('Incorrect Password!');


  const token=createTokenForUser(user);
return token
});



module.exports = mongoose.model("User", userSchema);
