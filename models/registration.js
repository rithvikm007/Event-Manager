const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        attendanceStatus: {
            type: String,
            enum: ["present", "absent"],
            default: "absent",
        },
        feedback: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
);

registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
