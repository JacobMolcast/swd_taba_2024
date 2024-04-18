const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "public")));
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

const register = require("./routes/register.js");
const {retrieve, update} = require("./routes/update.js");
const delete_account = require("./routes/delete_account.js");
const retrieve_all = require("./routes/admin.js");

const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const {
  initializePassport,
  authenticationMiddleware,
  checkNotAuthenticated,
} = require("./routes/auth.js");
initializePassport(passport);

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

app.post("/logout", authenticationMiddleware(), (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err); // remove this line for production
      return res.redirect("/login");
    }
    res.redirect("/login");
  });
});

app.get("/forgot-password", checkNotAuthenticated, function (req, res) {
  res.render("forgot-password");
});

app.get("/dashboard", authenticationMiddleware(), function (req, res) {
  res.render("dashboard", { name: req.user.first_name, id: req.user.customer_id});
});

app.get("/edit-profile", authenticationMiddleware(), (req, res) => {
  retrieve(req, res);
});

app.post("/edit-profile", authenticationMiddleware(), (req, res) => {
  update(req, res);
});

app.get("/delete-account", authenticationMiddleware(), (req, res) => {
  res.render("delete-account");
});

app.post("/delete-account", authenticationMiddleware(), (req, res) => {
  delete_account(req, res);
  req.session.destroy(function (err) {
    if (err) {
      console.error(err); // remove this line for production
      return res.redirect("/");
    }
    res.redirect("/");
  });
});

app.get("/admin", authenticationMiddleware(), (req, res) => {
  retrieve_all(req, res);
});
 
app.use((req, res, next) => {
  res.status(404);
  res.redirect('/'); // Render a specific 404 page
});

// Global error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500)
  res.redirect('/'); // Render a general eror page
});

app.listen(3000, () => console.log("Server is running on port 3000"));
