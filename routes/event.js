const express = require("express");
const router = express.Router();
const Event = require("../models/event");

// GET all Events
router.get("/all", async (req, res) => {
    const events = await Event.find();
    res.render("event/index", { events });
    // res.send(events);
});

// GET Single Event
router.get("/:id", async (req, res) => {
    const event = await Event.findById(req.params.id);
    res.render("event/show", { event });
});

// GET Create Form
router.get("/create", async (req, res) => {
    res.render("event/new");
});

//POST Create New Event
router.post("/create", async (req, res) => {
    const event = new Event(req.body);
    await event.save();
    res.redirect("/events");
});

//GET Update Form
router.get("/update/:id", async (req, res) => {
    const event = await Event.findById(req.params.id);
    res.render("event/update", { event });
});

router.post("/update/:id", async (req, res) => {
    const { name, description, date, location, contact } = req.body;
    await Event.findByIdAndUpdate(req.params.id, {
        name,
        description,
        date,
        location,
        contact,
    });
    res.redirect(`/events/${req.params.id}`);
});

//DELETE Event
router.delete("/:id", async (req, res) => {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect("/events/all");
});

module.exports = router;
