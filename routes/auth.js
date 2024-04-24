const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("../db.js");
const {encrypt, decrypt} = require("./crypto");

function initializePassport(passport) {
  let failedAttempts = {};
  const authenticateUser = async (userName, password, done) => {
    return db.query(
      `SELECT customer_id, first_name, user_password, admin_role FROM customers WHERE user_name = ? OR email = ? LIMIT 1`,
      [encrypt(userName), encrypt(userName)],
      function (error, results) {
        if (error) {
          return done(error);
        } else if (results.length === 0) {
          return done(null, false, {
            message: "No user or email with those credentials",
          });
        } else {
          try {
            bcrypt
              .compare(password, results[0].user_password)
              .then((match) => {
                if (match) {
                  failedAttempts[userName] = 0; // It reset the failed attempts counter for this particular user
                  return done(null, results[0]);
                } else {
                  failedAttempts[userName] = (failedAttempts[userName] || 0) + 1; // Increment the failed attempts counter
                  if (failedAttempts[userName] >= 3) { // Check if the user has failed too many times
                    return done(null, false, { message: "Too many failed login attempts" });
                  } else {
                    return done(null, false, { message: "Password incorrect" });
                  }
                }
              })
              .catch((e) => {
                return done(e);
              });
          } catch (e) {
            return done(e);
          }
        }
      },
    );
  };

  passport.use(
    new LocalStrategy({ usernameField: "user_name" }, authenticateUser),
  );
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

function authenticationMiddleware() {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

module.exports = {
  initializePassport,
  authenticationMiddleware,
  checkNotAuthenticated,
};
