const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const Student = require("../models/student");
const Registration = require("../models/registration");
const {
    checkAuthenticated,
    checkNotAuthenticated,
    checkOrganizer,
} = require("../middleware");

// GET all Events
router.get("/all", async (req, res) => {
    const events = await Event.find();
    for (let event of events) {
        if (req.user) {
            const registration = await Registration.findOne({
                eventId: event._id,
                studentId: req.user._id,
                role: "organizer",
            });
            event.isOrganizer = registration !== null;
        } else {
            event.isOrganizer = false;
        }
    }

    res.render("event/index", { events });
});

// Route to view events the logged-in user is organizing
router.get("/my-events", checkAuthenticated, async (req, res) => {
    const registrations = await Registration.find({
        studentId: req.user._id,
        role: "organizer",
    });

    const eventIds = registrations.map((reg) => reg.eventId);

    const events = await Event.find({ _id: { $in: eventIds } });

    res.render("event/my-events", { events });
});

// GET Create Form
router.get("/create", async (req, res) => {
    res.render("event/new");
});
// GET Single Event
// GET Single Event
router.get("/:id", async (req, res) => {
    const event = await Event.findById(req.params.id);
    let isOrganizer = false;
    let isRegistered = false;
    if (req.user) {
        const organizerCheck = await Registration.findOne({
            eventId: event._id,
            studentId: req.user._id,
            role: "organizer",
        });
        if (organizerCheck) {
            isOrganizer = true;
        }
        const registrationCheck = await Registration.findOne({
            eventId: event._id,
            studentId: req.user._id,
            role: "participant", 
        });
        if (registrationCheck) {
            isRegistered = true;
        }
    }

    res.render("event/show", { event, isOrganizer, isRegistered });
});

//POST Create New Event
router.post("/create", async (req, res) => {
    const event = new Event(req.body);
    await event.save();
    const registration = new Registration({
        eventId: event._id,
        studentId: req.user._id,
        role: "organizer",
    });
    await registration.save();
    res.redirect("/events/all");
});

//GET Update Form
router.get(
    "/update/:id",
    checkOrganizer,
    checkAuthenticated,
    async (req, res) => {
        const event = await Event.findById(req.params.id);
        res.render("event/update", { event });
    }
);

router.put(
    "/update/:id",
    checkOrganizer,
    checkAuthenticated,
    async (req, res) => {
        const {
            title,
            description,
            date,
            time,
            venue,
            capacity,
            organizer,
            tags,
        } = req.body;
        await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            time,
            venue,
            capacity,
            organizer,
            tags: tags.split(",").map((tag) => tag.trim()),
        });
        res.redirect(`/events/${req.params.id}`);
    }
);

//DELETE Event
router.delete("/:id", checkOrganizer, checkAuthenticated, async (req, res) => {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect("/events/all");
});

router.get("/register/:id", checkAuthenticated, (req, res) => {
    const eventId = req.params.id;

    res.render("event/register", { eventId });
});

router.post("/register/:id", checkAuthenticated, async (req, res) => {
    const eventId = req.params.id;
    const studentId = req.user._id;
    const { name, department, year } = req.body;
    const reg = await Registration.findOne({ eventId, studentId });
    if (reg) {
        req.flash("error", "You have already registered for this event.");
        return res.redirect(`/events/${eventId}`);
    }
    const registration = new Registration({
        eventId,
        studentId,
    });
    await registration.save();
    req.flash("success", "You have registered successfully.");
    res.redirect(`/events/${eventId}`);
});

module.exports = router;
