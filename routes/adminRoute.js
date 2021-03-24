var express = require('express');
var router = express.Router();

var User = require("../Modal/userSchema");
var Post = require("../Modal/postSchema");
var addTask = require("../Modal/addTaskSchema");

var passportLocal = require("passport-local");
var passport = require("passport");


passport.use(new passportLocal(User.authenticate()));

/* Get /admin Route for admin signIn Page */
router.get('/admin', function (req, res, next) {
    res.render('adminSignInPage');

});

/* Get /admin Route for admin signIn Page */
router.get('/adminSignUp', function (req, res, next) {
    res.render('adminSignUpPage');
});

/* Get /admin Route for admin signIn Page */
router.get('/addTaskforUserByAdmin', function (req, res, next) {
    res.render('addTaskforUserByAdmin');
});

/* GET /userDeleteProfilebyadmin/:username Route admin to delete user */

router.get('/userDeleteProfilebyadmin/:username', isLoggedIn, (req, res) => {
    User.findOneAndDelete({ username: req.params.username })
        .then(function (user) {
            if (!user) {
                res.send({ message: "id Not Valid , try again" });
            }
            else {
                res.redirect("/adminDashboardPageUsers");
            }
        })
})


/* Get /adminDashboardPageUsers Route for admin to see all users list */
router.get('/adminDashboardPageUsers', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user })
        .then(function (user) {
            if (!user) {
                req.json({ message: "User Not Valid , try again" });
            }
            else {
                User.find()
                    .then(userlist => {
                        var userList = userlist.filter((u, i) => {
                            return u.username !== "admin";
                        })
                        res.render("adminDashboardPageUsers", { user, userList })
                    })
            }
        })
});


/* Get /adminTaskDetailsPage Route for admin to check all task which assign to user */
router.get('/adminTaskDetailsPage', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user })
        .then(function (user) {
            if (!user) {
                req.json({ message: "User Not Valid , try again" });
            }
            else {
                addTask.find()
                    .then(addTask => {
                        res.render("adminTaskDetailsPage", { user, addTask })
                    })
            }
        })
});


/* Get /adminTaskDetailsList Route for admin to check all task which assign to user */
router.get('/adminTaskDetailsList', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user })
        .then(function (user) {
            if (!user) {
                req.json({ message: "User Not Valid , try again" });
            }
            else {
                addTask.find()
                    .then(addTask => {
                        User.find()
                        .then(userlist => {
                            var userList = userlist.filter((u, i) => {
                                return u.username !== "admin";
                            })
                            res.render("adminTaskDetailsList", { user, userList , addTask })
                        })
                    })
            }
        })
});

/* Get / completeTaskDetailsPage Route for admin to check all task which assign to user */
router.get('/completeTaskDetailsPage', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user })
        .then(function (user) {
            if (!user) {
                req.json({ message: "User Not Valid , try again" });
            }
            else {
                addTask.find()
                    .then(addTask => {
                        res.render("completeTaskDetailsPage", { user, addTask })
                    })
            }
        })
});

/* get /adminDashboardPage Route for admin to check users today's task Dashboard Page */
router.get('/adminDashboardPage', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user })
        .then(function (user) {
            if (!user) {
                req.json({ message: "User Not Valid , try again" });
            }
            else {
                Post.find({ "createdAt": { $gt: new Date(Date.now() - 1000 * 60 * 60 * 24) } }).
                    populate("postedByUser").
                    exec((err, posts) => {
                        Post.countDocuments()
                            .then((postCount) => {
                                User.countDocuments()
                                    .then((userCount) => {
                                        res.render("adminDashboardPage", { posts, user, postCount, userCount })

                                    })
                            })
                    })
            }
        })
});


/* POST /adminRegister Route for new admin signUp */
router.post('/adminRegister', function (req, res, next) {
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
    })
    User.register(newUser, req.body.password)
        .then(function (u) {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/adminDashboardPage")
            })
        })
        .catch(function (e) {
            res.json({ message: "Internal server", e });

        })
});

/* POST /adminLogin Route for admin login */
router.post('/adminLogin', passport.authenticate('local', {
    successRedirect: '/adminDashboardPage',
    failureRedirect: '/admin'
}), function (req, res, next) { });


/* GET /adminLogout Route for admin logout */
router.get('/adminLogout', function (req, res, next) {
    req.logout();
    res.redirect('/admin');
});

/* isLoggedIn Function for admin authentication */
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
