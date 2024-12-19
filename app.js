const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const port = 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

main()
    .then(() => {
        console.log("Connected to Database");
    })
    .catch((err) => {
        console.log(err);
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
}

const eventRoutes = require("./routes/event");
app.use("/events", eventRoutes);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
