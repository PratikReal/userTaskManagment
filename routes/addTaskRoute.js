var express = require('express');
var router = express.Router();

var User = require("../Modal/userSchema");
var Post = require("../Modal/postSchema");
var addTask = require("../Modal/addTaskSchema");

var passportLocal = require("passport-local");
var passport = require("passport");


passport.use(new passportLocal(User.authenticate()));

/* Get /adminDashboardPageAddTask Route for admin where admin can add task for user */
router.get('/adminDashboardPageAddTask', isLoggedIn, function (req, res, next) {
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
                        res.render("adminDashboardPageAddTask", { user, userList })
                    })
            }
        })
});


/* GET /addTaskForUserByAdmin /admin can go to add task for user page */
router.get('/addTaskforUserByAdmin/:username', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user }).then(function (admin) {
        if (!admin) {
            res.send({ message: "User Not Valid , try again" });
        }
        else {
            User.findOne({ username: req.params.username })
                .then(function (user) {
                    if (!user) {
                        res.send({ message: "id Not Valid , try again" });
                    }
                    else {
                        res.render("addTaskforUserByAdmin", { user, admin });
                    }
                })
        }
    })

});


/* GET /addTaskForUserByAdmin /admin can add task for user */
router.post('/addTaskforUserByAdmin', isLoggedIn, function (req, res, next) {

    const { username, addTaskDate, addTaskTitle, addTaskDiscription } = req.body;

    var newTask = new addTask({ username, addTaskDate, addTaskTitle, addTaskDiscription });
    User.findOne({ username: req.session.passport.user }).
        then((admin) => {
            newTask.postedByUser = admin;
            User.findOne({ username }).then((user) => {
                user.addTasks.push(newTask);
                user.save().then(() => {
                    admin.save().then(() => {
                        newTask.save()
                            .then(() => {
                                addTask.find().then((task) => {
                                    res.redirect("/adminTaskDetailsList");
                                })

                            })
                    })
                })

            })

        })
        .catch((err) => {
            console.log(err);
        })


});



/* GET /myTaskSendbyadmin Route for user to see task send by admin */
router.get('/myTaskSendByAdmin', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user })
        .then(function (user) {
            if (!user) {
                res.send({ message: "User Not Valid , try again" });
            }
            else {
                addTask.find()
                    .then(addTask => {
                        User.findOne({ username: req.session.passport.user })
                            .populate('addTask').exec((err, tasks) => {
                                res.render("myTaskSendByAdmin", { user, tasks, addTask });
                            })
                    })

            }
        })
});

/* GET /editProfile Route for user to  edit his Profile  */
router.get('/userTaskCompletePage', function (req, res, next) {
    User.findOne({ username: req.session.passport.user })
        .then(function (user) {
            if (!user) {
                res.send({ message: "User Not Valid , try again" });
            }
            else {
                res.render("userTaskCompletePage", { user });
            }
        })
});

/* GET /userProfile/:username Route for editProfilePage */
router.post('/checkTaskCompletetion/:id', isLoggedIn, function (req, res, next) {
    console.log(" Check Task Complete  working");
    User.findOne({ username: req.session.passport.user }).
        then(function (user) {
            if (!user) {
                res.send({ message: "User Not Valid , try again" });
            } else {
                addTask.findById(req.params.id)
                    .then(function (id) {
                        if (!id) {
                            res.send({ message: "id Not Valid , try again" });
                        }
                        else {
                            id.taskComplete = true;
                            user.addTasks.shift(id);
                            user.completeTask.unshift(id);
                            user.save().then(() => {
                                id.save().then(() => {
                                    console.log(user);

                                    res.render("userTaskCompletePage", { user });
                                })
                            })
                        }
                    })
            }
        })
});


/* GET /taskDetailsPageBy/:id Route for getting taskDetails */
router.get('/addTaskDetails/:id', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user }).
        then(function (user) {
            if (!user) {
                res.send({ message: "User Not Valid , try again" });
            } else {
                addTask.findById(req.params.id)
                    .then(function (id) {
                        if (!id) {
                            res.send({ message: "id Not Valid , try again" });
                        }
                        else {

                            res.render("task", { id });
                        }
                    })
            }
        })
});


/* GET /myTaskDetailsPage/:id Route for getting taskDetails for usrr */
router.get('/myTaskDetailsPage/:id', isLoggedIn, function (req, res, next) {
    User.findOne({ username: req.session.passport.user }).
        then(function (user) {
            if (!user) {
                res.send({ message: "User Not Valid , try again" });
            } else {
                addTask.findById(req.params.id)
                    .then(function (id) {
                        if (!id) {
                            res.send({ message: "id Not Valid , try again" });
                        }
                        else {
                            res.render("myTaskDetails", { id });
                        }
                    })
            }
        })
});



/* GET /userProfile/:username Route for editProfilePage */
router.post('/addCommentsByAdmin/:id', isLoggedIn, function (req, res, next) {
    const { addCommentsDiscription } = req.body;
    User.findOne({ username: req.session.passport.user }).
        then(function (user) {
            if (!user) {
                res.send({ message: "User Not Valid , try again" });
            } else {
                addTask.findById(req.params.id)
                    .then(function (id) {
                        if (!id) {
                            res.send({ message: "id Not Valid , try again" });
                        }
                        else {
                            var now = new Date();
                            var dateValue = now.toLocaleString('default', { month: 'long' }) + now.getDate();
                            var timeValue = now.getHours() + ":" + now.getMinutes();
                            const obj = {
                                user: user.username,
                                addCommentsDiscription,
                                date: dateValue,
                                time: timeValue
                            }
                            id.comments.unshift(obj);

                            user.save().then(() => {
                                id.save().then(() => {
                                    addTask.find()
                                        .then(addTask => {
                                            res.render("task", { user, id, addTask })
                                        })
                                })

                            })
                        }
                    })
            }
        })
});


/* GET /userProfile/:username Route for editProfilePage */
router.post('/addCommentsByUser/:id', isLoggedIn, function (req, res, next) {
    const { addCommentsDiscription } = req.body;
    User.findOne({ username: req.session.passport.user }).
        then(function (user) {
            if (!user) {
                res.send({ message: "User Not Valid , try again" });
            } else {
                addTask.findById(req.params.id)
                    .then(function (id) {
                        if (!id) {
                            res.send({ message: "id Not Valid , try again" });
                        }
                        else {
                            var now = new Date();

                            var dateValue = now.toLocaleString('default', { month: 'long' }) + now.getDate();
                            var timeValue = now.getHours() + ":" + now.getMinutes();

                            const obj = {
                                user: user.username,
                                addCommentsDiscription,
                                date: dateValue,
                                time: timeValue
                            }
                            id.comments.unshift(obj);
                            user.save().then(() => {
                                id.save().then(() => {
                                    addTask.find()
                                        .then(addTask => {
                                            User.findOne({ username: req.session.passport.user })
                                                .populate('addTask').exec((err, tasks) => {

                                                    res.render("myTaskDetails", { user, tasks, id, addTask });
                                                })
                                        })
                                })

                            })
                        }
                    })
            }
        })
});


/* isLoggedIn Function for admin authentication */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.render("404");
    }
}

module.exports = router;