const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const register = require("./routes/register.js");

const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const {
  initializePassport,
  authenticationMiddleware,
  checkNotAuthenticated,
} = require("./routes/auth.js");
initializePassport(passport);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
// app.use(bodyParser.json());

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/register", checkNotAuthenticated, function (req, res) {
  res.render("register");
});

app.post("/register", checkNotAuthenticated, (req, res) => {
  register(req, res);
});

app.get("/login", checkNotAuthenticated, function (req, res) {
  res.render("login");
});

app.post("/login", checkNotAuthenticated, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

app.post("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/login");
  });
});

app.get("/forgot-password", checkNotAuthenticated, function (req, res) {
  res.render("forgot-password");
});

app.get("/dashboard", authenticationMiddleware(), function (req, res) {
  res.render("dashboard", { name: req.user.first_name });
});

app.listen(3000, () => console.log("Server is running on port 3000"));
