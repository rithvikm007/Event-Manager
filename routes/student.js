const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Student = require("../models/student");
const {
    checkAuthenticated,
    checkNotAuthenticated,
    saveRedirectUrl,
} = require("../middleware");
const router = express.Router();

//GET Register Page
router.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("student/register");
});

// Register Handler
router.post("/register", checkNotAuthenticated, async (req, res) => {
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

        req.login(newStudent, (err) => {
            if (err) {
                console.error(err);
                req.flash("error", "An error occurred. Please try again.");
                return res.render("student/register");
            }
            res.redirect(res.locals.redirectUrl || "/");
        });
    } catch (err) {
        req.flash("error", "An error occurred. Please try again.");
        res.render("student/register");
    }
});

// Login Handler
router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/students/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", "You have logged in successfully.");
        res.redirect(res.locals.redirectUrl || "/");
    }
);

router.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("student/login");
});

// Logout Handler
router.get("/logout", checkAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.redirect("/dashboard");
        }
        req.flash("success", "You have logged out successfully.");
        res.redirect("/students/login");
    });
});

//GET Profile
router.get("/profile/:id", checkAuthenticated, async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findById(studentId);

        if (!student) {
            req.flash("error", "Student not found.");
            return res.redirect("/");
        }

        res.render("student/profile", { student });
    } catch (err) {
        req.flash("error", "An error occurred. Please try again.");
        res.redirect("/");
    }
});

router.post("/profile/:id", checkAuthenticated, async (req, res) => {
    try {
        const { name, email, department, year } = req.body;
        const studentId = req.params.id;

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { name, email, department, year },
            { new: true }
        );

        if (!updatedStudent) {
            req.flash("error", "Student not found.");
            return res.redirect("/");
        }

        req.flash("success", "Profile updated successfully");
        res.redirect(`/students/profile/${studentId}`);
    } catch (err) {
        req.flash("error", "An error occurred. Please try again.");
        res.redirect(`/students/profile/${studentId}`);
    }
});

module.exports = router;
