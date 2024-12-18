const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    capacity: { type: Number, required: true },
    organizer: { type: String, required: true },
    tags: [{ type: String }],
});

module.exports = mongoose.model("Event", eventSchema);
