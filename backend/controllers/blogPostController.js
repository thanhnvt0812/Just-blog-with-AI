import BlogPost from "../models/BlogPost.js";
import Comment from "../models/Comment.js";
import mongoose from "mongoose";
//---------------------------------------------
//@desc Create a new blog post
//@route POST /api/posts
//@access Private(admin only)
//---------------------------------------------
export const createPost = async (req, res) => {
  try {
    const { title, content, coverImageUrl, tags, isDraft, generateByAI } =
      req.body;
    const slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    const newPost = new BlogPost({
      title,
      slug,
      content,
      coverImageUrl,
      tags,
      author: req.user.id,
      isDraft,
      generateByAI,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create post", error: error.message });
  }
};
//---------------------------------------------
// @desc Get all blog posts by status (all, published, draft) and include counts
// @route GET /api/posts?status=all|published|draft&page=1
// @access Public
//---------------------------------------------
export const getAllPosts = async (req, res) => {
  try {
    const status = req.query.status || "published"; // default to published
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // determine filter for main posts response
    let filter = {};
    if (status === "published") filter.isDraft = false;
    else if (status === "draft") filter.isDraft = true;

    //fetch paginated posts
    const posts = await BlogPost.find(filter)
      .populate("author", "name profileImageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    //count total posts for pagination and tab counts
    const [totalCount, allCount, publishedCount, draftCount] =
      await Promise.all([
        BlogPost.countDocuments(filter), //for pagination of current tab
        BlogPost.countDocuments(),
        BlogPost.countDocuments({ isDraft: false }), //for published tab count
        BlogPost.countDocuments({ isDraft: true }), //for draft tab count
      ]);
    res.json({
      posts,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      count: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get all posts", error: error.message });
  }
};

//---------------------------------------------
// @desc Get a blog post by slug
// @route GET /api/posts/slug/:slug
// @access Public
//---------------------------------------------
export const getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).populate(
      "author",
      "name profileImageUrl"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get post by slug", error: error.message });
  }
};

//---------------------------------------------
// @desc Update a blog post
// @route PUT /api/posts/:id
// @access Private (admin only)
//---------------------------------------------
export const updatePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this post" });
    }
    const updatedData = req.body;
    if (updatedData.title) {
      updatedData.slug = updatedData.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }
    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update post", error: error.message });
  }
};

//---------------------------------------------
// @desc Delete a blog post
// @route DELETE /api/posts/:id
// @access Private (admin only)
//---------------------------------------------
export const deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    //delete comment related to post
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res
      .status(200)
      .json({ message: "Post and related comments deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete post", error: error.message });
  }
};

//---------------------------------------------
// @desc Get posts by tag
// @route GET /api/posts/tag/:tag
// @access Public
//---------------------------------------------
export const getPostByTag = async (req, res) => {
  try {
    const posts = await BlogPost.find({
      tags: req.params.tag,
      isDraft: false,
    }).populate("author", "name profileImageUrl");
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get posts by tag", error: error.message });
  }
};

//---------------------------------------------
// @desc Search blog posts
// @route GET /api/posts/search?q=term
// @access Public
//---------------------------------------------
export const searchPosts = async (req, res) => {
  try {
    const q = req.query.q;
    const posts = await BlogPost.find({
      isDraft: false,
      $or: [{ title: new RegExp(q, "i") }, { content: new RegExp(q, "i") }],
    }).populate("author", "name profileImageUrl");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

//---------------------------------------------
// @desc Increment view count of a post
// @route POST /api/posts/:id/view
// @access Public
//---------------------------------------------
export const incrementViews = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "View incremented" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to increment view", error: error.message });
  }
};

//---------------------------------------------
// @desc Like a post
// @route POST /api/posts/:id/like
// @access Private (logged in users only)
//---------------------------------------------
export const likePost = async (req, res) => {
  try {
    await BlogPost.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    res.status(200).json({ message: "Post liked" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to like post", error: error.message });
  }
};

//---------------------------------------------
// @desc Get trending posts by views
// @route GET /api/posts/trending
// @access Public
//---------------------------------------------
export const getTopPosts = async (req, res) => {
  try {
    //top 5 performing posts
    const posts = await BlogPost.find({ isDraft: false })
      .sort({ views: -1, like: -1 })
      .limit(5)
      .populate("author", "name profileImageUrl");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch trending posts",
      error: error.message,
    });
  }
};
