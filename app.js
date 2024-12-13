if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");       // requires the model with Passport-Local Mongoose plugged in

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;      // For Atlas

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });
    
async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store =  MongoStore.create({
    mongoUrl : dbUrl,
    crypto: {
        secret: process.env.SESSION_AND_STORE_SECRET
    },
    touchAfter: 24 * 3600     // time period in seconds
});


store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});


const sessionOptions = {
    secret: process.env.SESSION_AND_STORE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,     // in milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
    store: store
};


app.use( session(sessionOptions) );
app.use( flash() );

app.use( passport.initialize() );
app.use( passport.session() );
passport.use(new LocalStrategy(User.authenticate()));       // using static authenticate method of model in LocalStrategy

passport.serializeUser(User.serializeUser());       // using static serialize and deserialize of model for passport session support
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {       // Middleware for res.locals
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/listings", listingRouter);                // Listings
app.use("/listings/:id/reviews", reviewRouter);     // Reviews
app.use("/", userRouter);                           // Users


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
})

// Custom error handling middleware
app.use((err, req, res, next) => {
    let {statusCode = 500, message} = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});