var mongoose = require("mongoose");
var DatabaseUrl = "mongodb+srv://Pratik:Pratik123@cluster0.o8rtg.mongodb.net/userTask?retryWrites=true&w=majority"
// var localUrl = "mongodb://localhost/userTask";
mongoose.connect(DatabaseUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log(" Database Is Connected"))
    .catch((err) => console.log("DataBase Is Not Connected", err))

