const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: true,
        maxlength: 60,
    },
    department: { type: String, required: true },
    year: { type: Number, required: true },
});

module.exports = mongoose.model("Student", studentSchema);
