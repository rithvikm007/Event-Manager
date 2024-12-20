const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Student = require("../models/student");

const router = express.Router();

//GET Register Page
router.get("/register", (req, res) => {
    res.render("student/register");
});

// Register Handler
router.post("/register", async (req, res) => {
    const { studentId, name, email, department, year, password } = req.body;

    try {
        const existingUser = await Student.findOne({
            $or: [{ studentId }, { email }],
        });
        if (existingUser) {
            return res.render("student/register", {
                error: "Student ID or Email already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            studentId,
            name,
            email,
            department,
            year,
            password: hashedPassword,
        });

        await newStudent.save();
        res.redirect("/students/login");
    } catch (err) {
        console.error(err);
        req.flash("error", "An error occurred. Please try again.");
        res.render("student/register");
    }
});

// Login Handler
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/events/all",
        failureRedirect: "/students/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success_msg", "You have logged in successfully.");
        res.redirect("/events/all");
    }
);

router.get("/login", (req, res) => {
    res.render("student/login");
});

// Logout Handler
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.redirect("/dashboard");
        }
        req.flash("success", "You have logged out successfully.");
        res.redirect("/students/login");
    });
});

module.exports = router;
