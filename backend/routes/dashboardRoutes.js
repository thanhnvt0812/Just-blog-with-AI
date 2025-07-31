const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardController");

//admin only middleware
const adminOnly = (req, res, next) => {
  req.user && req.user.role == "admin"
    ? next()
    : res.status(403).json({ message: "Admin access only" });
};
router.get("/", protect, adminOnly, getDashboardSummary);
module.exports = router;
