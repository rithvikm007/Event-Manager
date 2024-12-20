const LocalStrategy = require("passport-local").Strategy;
const Student = require("./models/student");
const bcrypt = require("bcrypt");

function initializePassport(passport) {
    const authenticateUser = async (email, password, done) => {
        const user = await Student.findOne({ email });
        if (!user)
            return done(null, false, { message: "No user with that email" });
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (err) {
            return done(err);
        }
    };
    passport.use(
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
            },
            authenticateUser
        )
    );
    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (id, done) => {
        const user = await Student.findById(id);
        done(null, user);
    });
}

module.exports = initializePassport;
