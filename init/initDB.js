const mongoose = require("mongoose");
const Event = require("../models/event");
const Student = require("../models/student");
const Registration = require("../models/registration");
require("dotenv").config({ path: "../.env" });

const eventData = require("./events.json");
const main = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to Database");
    await Event.deleteMany({});
    await Student.deleteMany({});
    await Registration.deleteMany({});
    console.log("Database cleared");
    await Event.insertMany(eventData);
    console.log("Events added");
};

main();