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
router.get("/organised", checkAuthenticated, async (req, res) => {
    const registrations = await Registration.find({
        studentId: req.user._id,
        role: "organizer",
    });

    const eventIds = registrations.map((reg) => reg.eventId);

    const events = await Event.find({ _id: { $in: eventIds } });

    res.render("event/organised", { events });
});

// GET Create Form
router.get("/create", async (req, res) => {
    res.render("event/new");
});

//GET Registered
router.get("/registered", checkAuthenticated, async (req, res) => {
    const studentId = req.user._id;

    try {
        const registrations = await Registration.find({
            studentId,
            role: "participant",
        }).populate("eventId");

        res.render("event/registered", { registrations });
    } catch (error) {
        req.flash(
            "error",
            "An error occurred while fetching your registrations."
        );
        res.redirect("/");
    }
});

// GET Single Event
router.get("/:id", async (req, res) => {
    const event = await Event.findById(req.params.id);
    let isOrganizer = false;
    let isRegistered = false;
    let feedback = null;
    let rating = null;
    let allFeedback = []; // Define it here

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

    // console.log(isRegistered);
    res.render("event/show", {
        event,
        isOrganizer,
        isRegistered,
    });
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

//PUT Update
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

//GET Register Form
router.get("/register/:id", checkAuthenticated, (req, res) => {
    const eventId = req.params.id;

    res.render("event/register", { eventId });
});

//POST Register
router.post("/register/:id", checkAuthenticated, async (req, res) => {
    const eventId = req.params.id;
    const studentId = req.user._id;
    const { name, department, year } = req.body;
    const reg = await Registration.findOne({ eventId, studentId });
    if (reg) {
        if (reg.role === "organizer") {
            req.flash("error", "You the organizer for this event.");
            return res.redirect(`/events/${eventId}`);
        } else {
            req.flash("error", "You have already registered for this event.");
            return res.redirect(`/events/${eventId}`);
        }
    }
    const registration = new Registration({
        eventId,
        studentId,
    });
    await registration.save();
    req.flash("success", "You have registered successfully.");
    res.redirect(`/events/${eventId}`);
});

//GET Attendance
router.get("/attendance/:id", checkOrganizer, async (req, res) => {
    const eventId = req.params.id;

    try {
        const registrations = await Registration.find({
            eventId,
            role: "participant",
        });
        const students = await Student.find();

        // Calculate attendance percentage
        const totalRegistrations = registrations.length;
        const presentCount = registrations.filter(
            (registration) => registration.attendanceStatus === "present"
        ).length;
        const attendancePercentage =
            totalRegistrations > 0
                ? ((presentCount / totalRegistrations) * 100).toFixed(2)
                : 0;

        // Pass data to the front-end
        res.render("event/attendance", {
            registrations,
            students,
            eventId,
            attendancePercentage,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving attendance data");
    }
});

//POST Attendance
router.post("/attendance/save", async (req, res) => {
    const { eventId, attendance } = req.body;

    try {
        const attendanceList = Array.isArray(attendance)
            ? attendance
            : [attendance];

        await Registration.updateMany(
            { eventId },
            { $set: { attendanceStatus: "absent" } }
        );

        if (attendanceList.length > 0) {
            await Registration.updateMany(
                { _id: { $in: attendanceList } },
                { $set: { attendanceStatus: "present" } }
            );
        }
        req.flash("success", "Attendance saved successfully.");
        res.redirect(`/events/${eventId}`);
    } catch (error) {
        console.error("Error saving attendance:", error);
        req.flash("error", "Error saving attendance.");
        res.redirect(`/events/${eventId}`);
    }
});

// GET Feedback
router.get("/feedback/:eventId", checkAuthenticated, async (req, res) => {
    const eventId = req.params.eventId;
    const studentId = req.user._id;

    const registration = await Registration.findOne({ eventId, studentId });

    if (!registration) {
        req.flash("error", "You must register for the event to give feedback.");
        return res.redirect(`/events/${eventId}`);
    }

    res.render("event/feedback", { registration, eventId });
});

// POST Feedback
router.post("/feedback/:eventId", checkAuthenticated, async (req, res) => {
    const eventId = req.params.eventId;
    const studentId = req.user._id;
    const { feedback, rating } = req.body;

    if (!feedback || !rating) {
        req.flash("error", "Feedback and rating are required.");
        return res.redirect(`/events/${eventId}`);
    }

    if (rating < 1 || rating > 5) {
        req.flash("error", "Rating must be between 1 and 5.");
        return res.redirect(`/events/${eventId}`);
    }

    const registration = await Registration.findOneAndUpdate(
        { eventId, studentId },
        { feedback, rating },
        { new: true }
    );

    if (!registration) {
        req.flash(
            "error",
            "You must register for the event to submit or update feedback."
        );
        return res.redirect(`/events/${eventId}`);
    }

    req.flash("success", "Thank you for your feedback and rating!");
    res.redirect(`/events/${eventId}`);
});

// PUT Feedback (for updating feedback and rating)
router.put("/feedback/:eventId", checkAuthenticated, async (req, res) => {
    const eventId = req.params.eventId;
    const studentId = req.user._id;
    const { feedback, rating } = req.body;

    if (!feedback || !rating) {
        req.flash("error", "Feedback and rating are required.");
        return res.redirect(`/events/${eventId}`);
    }

    if (rating < 1 || rating > 5) {
        req.flash("error", "Rating must be between 1 and 5.");
        return res.redirect(`/events/${eventId}`);
    }

    const registration = await Registration.findOneAndUpdate(
        { eventId, studentId },
        { feedback, rating },
        { new: true }
    );

    if (!registration) {
        req.flash(
            "error",
            "You must register for the event to submit or update feedback."
        );
        return res.redirect(`/events/${eventId}`);
    }

    req.flash("success", "Your feedback and rating have been updated!");

    const event = await Event.findById(eventId);
    const isOrganizer = await Registration.exists({
        eventId,
        studentId,
        role: "organizer",
    });
    const isRegistered = await Registration.exists({
        eventId,
        studentId,
        role: "participant",
    });

    const updatedFeedback = await Registration.findOne({
        eventId,
        studentId,
    });

    const allFeedback = await Registration.find({
        eventId,
        feedback: { $exists: true },
    });

    res.render("event/show", {
        event,
        isOrganizer,
        isRegistered,
        feedback: updatedFeedback.feedback,
        rating: updatedFeedback.rating,
        allFeedback,
        editMode: false,
    });
});

//GET All Feedback
router.get("/feedbacks/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).send("Event not found.");
        }

        const registrations = await Registration.find({
            eventId,
            feedback: { $ne: "" },
            rating: { $ne: null },
        }).populate("studentId", "name");

        const feedbacks = registrations.map((reg) => ({
            feedback: reg.feedback,
            rating: reg.rating,
            studentName: reg.studentId.name,
        }));

        const avgRating =
            feedbacks.reduce((sum, reg) => sum + reg.rating, 0) /
                feedbacks.length || 0;

        res.render("event/allfeedbacks", { event, feedbacks, avgRating });
    } catch (error) {
        req.flash("error", "An error occurred while fetching feedback.");
        res.redirect(`/events/${eventId}`);
    }
});

module.exports = router;
