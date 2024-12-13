const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignupForm)        // Signup Route (To provide form)
    .post(userController.signup);        // Signup Route (Actual signup)


router.route("/login")
    .get(userController.renderLoginForm)       // Login Route (To provide form)
    .post(                                     // Login Route (Actual login)
        saveRedirectUrl,        // using this middleware since passport resets req.session after logging in
        passport.authenticate("local", 
        {   failureRedirect: "/login", 
            failureFlash: true
        }), 
        userController.login
    );


// Logout Route
router.get("/logout", userController.logout);


module.exports = router;