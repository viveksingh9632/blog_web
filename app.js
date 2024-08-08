require('dotenv').config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require('express-session');
var cookieParser = require('cookie-parser')



const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog.js");
const {checkForAuthenticationCookie}= require('./middlewares/authentication.js')




const app = express();
const PORT = 7000;



mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch(err => {
  console.error("Failed to connect to MongoDB", err);
});

app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));


app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});


app.use(express.json());


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


app.use(express.static('uploads'));

// URL-encoded बॉडी को पार्स करने के लिए
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));



// app.get('/', (req, res) => {
//   res.render('home', { user: req.user });
// });

// app.get('/', (req, res) => {
//   if (req.user) {  // assuming req.user holds the logged-in user's information
//     console.log(req.user);  // Debugging output

//       res.locals.user = req.user;
//   }
//   res.render('home');  // 'template' should be the name of your EJS file
// });
const User=require("./models/user.js")

app.get('/', async (req, res) => {
  if (req.user) {  // assuming req.user holds the logged-in user's token information
    // Fetch the full user object from the database using the user ID from the token
    const fullUser = await User.findById(req.user._id);
    if (fullUser) {
      res.locals.user = fullUser;
    } else {
      console.log('User not found in the database');
    }
  }
  res.render('home');  // 'home' should be the name of your EJS file
});


app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
