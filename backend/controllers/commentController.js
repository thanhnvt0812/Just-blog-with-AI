import Comment from "../models/Comment.js";
import BlogPost from "../models/BlogPost.js";

//---------------------------------------------
// @desc Add a comment to a blog post
// @route POST /api/comments/:postId
// @access Private
//---------------------------------------------
export const addComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;
    //ensure post exists
    const post = await BlogPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content,
      parentComment: parentComment || null,
    });
    await comment.populate("author", "name profileImageUrl");
    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add comment", error: error.message });
  }
};
//---------------------------------------------
// @desc Get all comments for a specific post
// @route GET /api/comments/:postId
// @access Public
//---------------------------------------------
export const getCommentByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate("author", "name profileImageUrl")
      .populate("post", "title coverImageUrl")
      .sort({ createdAt: 1 }); //for replies come in order
    //create map for commentId => comment objects
    const commentMap = {};
    comments.forEach((comment) => {
      comment = comment.toObject(); //convert mongoose document to plain object
      comment.replies = []; //initialize replies array
      commentMap[comment._id] = comment;
    });
    //nest replies under their parent comments
    const nestedComments = [];
    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) parent.replies.push(commentMap[comment._id]);
      } else nestedComments.push(commentMap[comment._id]);
    });

    res.json(nestedComments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get comments", error: error.message });
  }
};

//---------------------------------------------
// @desc Delete a comment and its associated replies (author or admin only)
// @route DELETE /api/comments/:commentId
// @access Private (only owner or admin)
//---------------------------------------------
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    await comment.deleteOne({ _id: commentId });
    //delete all replies
    await Comment.deleteMany({ parentComment: commentId });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: error.message });
  }
};

//---------------------------------------------
// @desc Get all comments in the system
// @route GET /api/comments
// @access Public
//---------------------------------------------
export const getAllComment = async (req, res) => {
  try {
    //fetch all comments with author populated
    const comments = await Comment.find()
      .populate("author", "name profileImageUrl")
      .populate("post", "title coverImageUrl")
      .sort({ createdAt: 1 }); //for replies come in order
    //create map for commentId => comment objects
    const commentMap = {};
    comments.forEach((comment) => {
      comment = comment.toObject(); //convert from Mongoose document to plain object
      comment.replies = []; //initialize replies array
      commentMap[comment._id] = comment;
    });
    //nested replies under their parent comments
    const nestedComments = [];
    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent.replies.push(commentMap[comment._id]);
        }
      } else {
        nestedComments.push(commentMap[comment._id]);
      }
    });
    res.status(200).json(nestedComments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get all comments", error: error.message });
  }
};
