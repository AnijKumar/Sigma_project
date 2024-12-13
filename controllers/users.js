const User = require("../models/user.js");


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};


module.exports.signup = async (req, res) => {       // using try catch instead of wrapAsync because we wanted specific error handling instead of centralized error handling 
    try {
        let { username, email, password } = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);      // using static register method of model to register a new user instance with a given password, checks if username is unique
        console.log(registeredUser);

        req.login(registeredUser, (err) => {        // Automatic login after signup
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust");
            res.redirect("/listings");
        });
    }
    catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};


module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to WanderLust ! You are logged in.");
    
    let redirectUrl = res.locals.redirectUrl || "/listings";        // || "/listings" to account for the case: when logged in from Home page (isLoggedIn not triggered)
    res.redirect(redirectUrl);
};


module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "Logged out successfully.");
        res.redirect("/listings");
    });
};