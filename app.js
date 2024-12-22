const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const Student = require("./models/student");
const Event = require("./models/event");
const Registration = require("./models/registration");

const initializePassport = require("./passport-config");
initializePassport(passport);
dotenv.config();

const port = 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

main()
    .then(() => {
        console.log("Connected to Database");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(flash());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

const eventRoutes = require("./routes/event");
app.use("/events", eventRoutes);

const studentRoutes = require("./routes/student");
app.use("/students", studentRoutes);

// Home Page Route
app.get("/", async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.render("home", {
            user: null,
            organizedEvents: null,
            registeredEvents: null,
        });
    }

    const organizedRegistrations = await Registration.find({
        studentId: user._id,
        role: "organizer",
    });
    const organizedEventIds = organizedRegistrations.map((reg) => reg.eventId);
    const organizedEvents = await Event.find({
        _id: { $in: organizedEventIds },
    });

    const registeredRegistrations = await Registration.find({
        studentId: user._id,
        role: "participant",
    });
    const registeredEventIds = registeredRegistrations.map(
        (reg) => reg.eventId
    );
    const registeredEvents = await Event.find({
        _id: { $in: registeredEventIds },
    });
    // console.log(registeredEvents);
    res.render("home", { user, organizedEvents, registeredEvents });
});
