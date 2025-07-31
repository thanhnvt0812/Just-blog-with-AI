import BlogPost from "../models/BlogPost.js";
import Comment from "../models/Comment.js";

//---------------------------------------------
// @desc Dashboard summary data
// @route POST /api/dashboard-summary
// @access Private(only admmin)
//---------------------------------------------
export const getDashboardSummary = async (req, res) => {
  try {
    //basics count
    const [totalPosts, drafts, published, totalComments, aiGenerated] =
      await Promise.all([
        BlogPost.countDocuments(),
        BlogPost.countDocuments({ isDraft: true }),
        BlogPost.countDocuments({ isDraft: false }),
        Comment.countDocuments(),
        BlogPost.countDocuments({ aiGenerated: true }),
      ]);
    const totalViewAgg = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalLikeAgg = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]);
    const totalViews = totalViewAgg[0]?.total || 0;
    const totalLikes = totalLikeAgg[0]?.total || 0;
    //top 5 performing posts
    const topPosts = await BlogPost.find({ isDraft: false })
      .select("title slug coverImageUrl views likes")
      .sort({ views: -1, likes: -1 })
      .limit(5);
    //recent comments
    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "name profileImageUrl")
      .populate("post", "title coverImageUrl");
    //tag usage aggregation
    const tagUsage = await BlogPost.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { tag: "$_id", count: 1, _id: 1 } },
      { $sort: { count: -1 } },
    ]);
    res.json({
      stats: {
        totalPosts,
        drafts,
        published,
        totalComments,
        aiGenerated,
        totalViews,
        totalLikes,
      },
      topPosts,
      recentComments,
      tagUsage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};
