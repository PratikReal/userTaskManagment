var mongoose = require("mongoose");

var PLM = require("passport-local-mongoose");

var postSchema = mongoose.Schema({

    date: { type: Date, default: Date.now },
    startTime: String,
    endTime: String,
    todayTaskDiscription: String,
    tomorrowTaskDiscription: String,
    postedBy: String,
    postedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

}, { timestamps: true });

postSchema.plugin(PLM);



module.exports = mongoose.model("post", postSchema);