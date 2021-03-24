var express = require('express');
var router = express.Router();

//SchemaS
var User = require("../Modal/userSchema");
var Post = require("../Modal/postSchema");
var addTask = require("../Modal/addTaskSchema");

var passportLocal = require("passport-local");
var passport = require("passport");

const multer = require('multer');

const bcrypyt = require("bcryptjs");
const nodemailer = require("nodemailer");

//local Strategy
passport.use(new passportLocal(User.authenticate()));

/* multer codinng  Start*/
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploades")
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

var upload = multer({ storage: storage, fileFilter: fileFilter });

/* Post /uploade Route for user's Profile Update*/

router.post("/uploade", upload.single("prflimage"), function (req, res, next) {
  const file = req.file
  if (!file) {

    return res.redirect("/editProfile");
  }
  else {
    var imagurl = "./images/uploades/" + req.file.filename;
    User.findOne({ username: req.session.passport.user })
      .then(function (user) {
        user.profilePic = imagurl;
        user.save();
        res.redirect("/editProfile");
      })
      .catch(function (err) {
        res.send({ message: "User Not Valid , try again " });

      })
  }
})

/* multer codinng  End*/

// Password code Start.....


/* GET /forgetPassword Route for goto Forget password Page  */
router.get('/forgetPassword', function (req, res, next) {
  res.render('forgetPasswordPage');
});


/* Post /forgetPassword Route for user to Forget password Page and genret random password  */
router.post("/forgetPassword", (req, res, next) => {
  let password = String(Math.floor(Math.random() * (99999999 - 100000) + 100000));
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        req.flash("success_msg", "Email not Found")
        res.redirect("/forgetPassword")
      } else {

        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "pratikb@setblue.com",
            pass: "PratikB@123"
          }
        })

        var mailOptions = {
          from: "pratikb@setblue.com",
          to: req.body.email.trim(),
          subject: "Auto Genereted Password",
          text: `your Password is : ${password}`
        }

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) res.redirect("/forgetPassword");

          bcrypyt.genSalt(10, (err, salt) => {
            bcrypyt.hash(password, salt, (err, hash) => {
              if (err) throw err;
              user.password = hash;
              user.save();
              req.flash("success_msg", "Email sent succesfully| Please Check You mail");
              res.redirect("/forgetPassword");
            })
          })

        })
      }


    })
});

/* GET /change passwortd Route for user to change his password */
router.get("/changePassword", isLoggedIn, (req, res, next) => {
  let errors = [];
  res.render("changePasswordPage", { errors });
})


router.post("/changePassword", (req, res, next) => {
  const { oldPassword, newPassword, newPassword2 } = req.body;

  let errors = [];

  if (!oldPassword || !newPassword || !newPassword2) {
    errors.push({ msg: "please fill all fields" });
  }

  if (newPassword != newPassword2) {
    errors.push({ msg: "both passwords are not same" })
  }
  if (newPassword.length < 6) {
    errors.push({ msg: "password length should be atleast 6 characters" });
  }

  if (errors.length > 0) {
    res.render("changePasswordPage", { errors });
  } else {
    User.findOne({ username: req.session.passport.user })
      .then(user => {
        if (user) {
          let check = bcrypyt.compareSync(req.body.oldPassword, user.password);
          if (check === true) {

            errors.push({ msg: "Password Changed Succesfully , Please Login" });
            bcrypyt.genSalt(10, (err, salt) => {
              bcrypyt.hash(req.body.newPassword, salt, (err, hash) => {
                if (err) {
                  console.log(err)
                } else {
                  user.setPassword(req.body.newPassword, function (err, user) {
                    if (err) {
                      res.redirect("/changePassword")
                    } else {
                      user.save();
                    }
                  })
                }
              })
            })
            res.render("changePasswordPage", { errors });
          } else {
            errors.push({ msg: "Old Password was incorrect" })
            res.render("changePasswordPage", { errors })
          }
        } else {
          console.log(err);
          res.redirect("/")
        }
      })
  }
})

// Password code End .....

// Profile Routes code Start .....

/* GET /profile Route for user to go on  Profile */
router.get('/profile', isLoggedIn, function (req, res, next) {
  User.findOne({ username: req.session.passport.user })
    .then(function (user) {
      if (!user) {
        res.send({ message: "User Not Valid , try again" });
      }
      else {
        User.findOne({ username: req.session.passport.user })
          .populate('userPosts').exec((err, posts) => {
            res.render("profilePage", { posts, user });
          })
      }
    })
});

/* GET /editProfile Route for user to  edit his Profile  */
router.get('/editProfile', function (req, res, next) {
  User.findOne({ username: req.session.passport.user })
    .then(function (user) {
      if (!user) {
        res.send({ message: "User Not Valid , try again" });
      }
      else {
        res.render("editProfilePage", { user });
      }
    })
});

/* POST /editProfile Route for user to send edit information and send to  Profile Page */
router.post("/editProfile", isLoggedIn, function (req, res, next) {
  const { firstName, lastName, email, number } = req.body;
  const updatedUser = { firstName, lastName, email, number };
  User.findOneAndUpdate(
    { username: req.session.passport.user },
    { $set: updatedUser },
    { new: true, useFindAndModify: false })
    .then(function (user) {
      if (!user) {
        res.send({ message: "User Not Valid , try again" });
      }
      else {
        res.render("profilePage", { user });
      }
    })
})


/* GET /userProfile/:username Route  for admin to seee user profile  */
router.get('/userProfile/:username', isLoggedIn, function (req, res, next) {
  User.findOne({ username: req.params.username })
    .then(function (user) {
      if (!user) {
        res.send({ message: "id Not Valid , try again" });
      }
      else {
        res.render("userProfileByAdmin", { user });
      }
    })
});

// Profile Routes code END .....

/* GET / Route for go to signInPage */
router.get('/',function (req, res, next) {
  res.render('signInPage');
});

/* GET /signUp Route for go to signUpPage */
router.get('/signUp', function (req, res, next) {
  res.render('signUpPage', { message: req.flash("message") });
});


/* POST /register Route for new User signUp */
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  let errors = [];

  //check required fields
  if (!username || !email || !password) {
    errors.push({ msg: "please fill all fields" });
  }

  //check username length
  if (username.length < 5) {
    errors.push({ msg: "username length should be atleast 5 characters" });
  }

  //check password length
  if (password.length < 5) {
    errors.push({ msg: "password length should be atleast 5 characters" });
  }

  if (errors.length > 0) {
    res.render("signUpPage", {
      errors,
      username,
      email,
      password
    })
  } else {
    // validation pass
    User.findOne({ username: username })
      .then(user => {
        if (user) {
          //user
          errors.push({ msg: "username name already registered" })
          res.render("signUpPage", {
            errors,
            username,
            email,
            password
          })
        } else {
          User.findOne({ email: email })
            .then(user => {
              if (user) {
                //user 
                errors.push({ msg: "Email is already registered" })
                res.render("signUpPage", {
                  errors,
                  username,
                  email,
                  password
                })
              } else {
                User.register({
                  name: req.body.name,
                  username: req.body.username,
                  email: req.body.email
                },
                  req.body.password, function (err, user) {
                    if (err) {
                      res.redirect("/signUpPage")
                    } else {
                      passport.authenticate("local")(req, res, function () {
                        bcrypyt.genSalt(10, (err, salt) => {
                          bcrypyt.hash(req.body.password, salt, (err, hash) => {
                            if (err) {
                            } else {
                              user.password = hash;
                              user.save();
                              req.flash("success_msg", "Registered Successfully , Login Here")
                              res.redirect("/")
                            }
                          })
                        })
                      })
                    }
                  })
              }
            })
        }
      })
  }
});


/* POST /login Route for User login */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/addPost',
  failureRedirect: '/'
}), function (req, res, next) { });


/* get /addPost Route for user Success after Login/Register */
router.get('/addPost', isLoggedIn, function (req, res, next) {
  console.log(req.session);
  console.log(req.session.passport);

  User.findOne({ username: req.session.passport.user })
    .then(function (user) {
      if (!user) {
        res.send({ message: "User Not Found , try again" });
      }
      else {
        res.render("addPostPage", { user });
      }
    })
});

/* Post /addPost Route for user add Posts*/

router.post('/addPost', isLoggedIn, function (req, res, next) {
  const { date, startTime, endTime, todayTaskDiscription, tomorrowTaskDiscription } = req.body;

  var newPost = new Post({ date, startTime, endTime, todayTaskDiscription, tomorrowTaskDiscription });
  User.findOne({ username: req.session.passport.user }).
    then(user => {
      newPost.postedByUser = user;
      newPost.profilePic = user;
      user.posts.unshift(newPost);
      user.save().then(() => {
        newPost.save()
          .then(() => {
            res.render("profilePage", { user })
          })
      })
    })
    .catch(err => res.send({ message: "intrnal server Problam", error: err }))
});

/* get /logout Route for User logout */
router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logout();
  res.redirect('/');
});

/* isLoggedIn Function for user Authentication */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.render("404");
  }
}

module.exports = router;
