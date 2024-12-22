const jwt = require("jsonwebtoken");
const Registration = require("./models/registration");
const authorize = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
};

module.exports = authorize;

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = authenticate;

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You need to log in to access this page.");
    res.redirect("/students/login");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

function saveRedirectUrl(req, res, next) {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
}

async function checkOrganizer(req, res, next) {
    const eventId = req.params.id;
    const studentId = req.user ? req.user._id : null;

    if (!studentId) {
        req.flash("error", "You need to be logged in to perform this action.");
        return res.redirect("/students/login");
    }

    const registration = await Registration.findOne({
        eventId,
        studentId,
        role: "organizer",
    });

    if (!registration) {
        req.flash("error", "You are not the organizer of this event.");
        return res.redirect(`/events/${eventId}`);
    }

    next();
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    saveRedirectUrl,
    checkOrganizer,
};
