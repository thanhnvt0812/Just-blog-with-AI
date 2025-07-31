const express = require("express");
const router = express.Router();
const {
  addComments,
  getCommentByPost,
  deleteComment,
  getAllComment,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/:postId", protect, addComments);
router.get("/:postId", getCommentByPost);
router.delete("/:commentId", protect, deleteComment);
router.get("/", getAllComment);

module.exports = router;
