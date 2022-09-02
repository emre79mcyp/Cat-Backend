const express = require("express");
const cors = require("cors");
const path = require("path");
const trans = require("./routes/trans");

const app = express();

app.use(express.json()); // this line is used to read json sent from user
app.use(express.urlencoded({ extended: true })); // this line is to read data sent by user through form (extended means user can sent nested json object also)

app.options("*", cors()); // enabling cors mean other servers can also user our endpoints
app.use(cors());

const dir = path.join(__dirname, "public");
app.use(express.static(dir)); // this lines specifies our static folder (which files user can access)

app.get("/api/", (req, res) => {
  // res.status(404).sendFile( path.join( __dirname, '/public/notfound.html'))
  res.redirect("/notfound.html");
});

app.use("/api/trans", trans);

app.get("*", (req, res) => {
  res.redirect("/notfound.html");
  // res.status(404).sendFile( path.join( __dirname, '/public/notfound.html'))
});

const errorHandler = (err, req, res, next) => {
  console.log("Error handling.", err);
  if (err) {
    res.status(403).json({
      success: false,
      error: err.message,
    });
  }
};
app.use(errorHandler); // express middleware wants three argument in his function. if we pass 4 arguments then its mean that we are making a error handler function and this will automatically called when there is any error in express route

module.exports = app;
