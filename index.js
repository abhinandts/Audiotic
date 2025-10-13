require("dotenv").config();
const express = require("express");
const nocache = require("nocache");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Global middleware
app.use(nocache());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Unified session middleware with role-based separation
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
    },
  })
);

// Template engine setup
const ejsLayouts = require("express-ejs-layouts");
app.set("view engine", "ejs");
app.use(ejsLayouts);

// Static file serving - Global public folder
app.use(express.static("public"));

// User-specific static files
app.use("/css", express.static("public/user/css"));
app.use("/fonts", express.static("public/user/fonts"));
app.use("/imgs", express.static("public/user/imgs"));
app.use("/js", express.static("public/user/js"));
app.use("/sass", express.static("public/user/sass"));
app.use("/scripts", express.static("public/user/scripts"));

// Admin static files (with /admin prefix)
app.use("/admin/css", express.static("public/admin/css"));
app.use("/admin/fonts", express.static("public/admin/fonts"));
app.use("/admin/imgs", express.static("public/admin/imgs"));
app.use("/admin/js", express.static("public/admin/js"));
app.use("/admin/sass", express.static("public/admin/sass"));
app.use("/admin/scripts", express.static("public/admin/scripts"));
app.use("/admin/productImages", express.static("public/admin/productImages"));
app.use("/admin/bannerImages", express.static("public/admin/bannerImages"));

// User routes (mounted at root)
const userRoute = require("./routes/userRoute");
// Set view settings for user routes
app.use(
  "/",
  (req, res, next) => {
    res.locals.layout = "../user/layouts/fullWidth";
    app.set("views", "./views/user");
    next();
  },
  userRoute
);

// Admin routes (mounted at /admin)
const adminRoute = require("./routes/adminRoute");
// Set view settings for admin routes
app.use(
  "/admin",
  (req, res, next) => {
    res.locals.layout = "../admin/layouts/fullWidth";
    app.set("views", "./views/admin");
    next();
  },
  adminRoute
);

// Global 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).send("Internal server error");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
