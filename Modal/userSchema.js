var mongoose = require("mongoose");
var PLM = require("passport-local-mongoose");
var userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    number: Number,
    posts: Array,
    addTasks:Array,
    completeTask:Array,
    profilePic: {
        type: String,
        default: '/images/def.jpg'
    },
    userPosts: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    addTask: { type: mongoose.Schema.Types.ObjectId, ref: "addTask" }



}, { timestamps: true });

userSchema.plugin(PLM);

module.exports = mongoose.model("user", userSchema);