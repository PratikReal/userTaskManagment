var mongoose = require("mongoose");

var PLM = require("passport-local-mongoose");

var addTaskSchema = mongoose.Schema({
    username: {
        type: String,
        unique: false
    },
    taskTimeDiff: String,
    taskComplete: { type: Boolean, default: false },
    addTaskDate: { type: Date, default: Date.now },
    addTaskTitle: String,
    addTaskDiscription: String,
    comments:Array,

    postedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "user" },


}, { timestamps: true });

addTaskSchema.plugin(PLM);

module.exports = mongoose.model("addTask", addTaskSchema);