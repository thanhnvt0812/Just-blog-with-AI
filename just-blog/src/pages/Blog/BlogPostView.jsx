/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { LuCircleAlert, LuDot, LuSparkles } from "react-icons/lu";
import { UserContext } from "../../context/userContext";
import CommentReplyInput from "../../components/Inputs/CommentReplyInput";
import toast from "react-hot-toast";
import TrendingPostSection from "./components/TrendingPostSection";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import { useNavigate, useParams } from "react-router-dom";
import BlogLayOut from "../../components/layouts/BlogLayout/BlogLayout";
import MarkdownContent from "./components/MarkdownContent";
import SharePost from "./components/SharePost";
import { sanitizeMarkdown } from "../../utils/helper";
import CommentInfoCard from "./components/CommentInfoCard";
import Drawer from "../../components/Loader/Drawer";
import LikeCommentButton from "./components/LikeCommentButton";
import { LuMessageCircleDashed } from "react-icons/lu";
const BlogPostView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogPostData, setBlogPostData] = useState(null);
  const [comments, setComments] = useState(null);
  const { user, setOpenAuthForm } = useContext(UserContext);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [openSummarizeDrawer, setOpenSummarizeDrawer] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  //get post data by slug
  const fetchPostDetailsBySlug = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.POSTS.GET_BY_SLUG(slug)
      );
      if (response.data) {
        const data = response.data;
        setBlogPostData(data);
        fetchCommentsByPostId(data._id);
        incrementViews(data._id);
      }
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
    }
  };
  //get comments
  const fetchCommentsByPostId = async (postId) => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.COMMENTS.GET_ALL_BY_POST(postId)
      );
      if (response.data) setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  // generate blog summary
  const generateBlogPostSummary = async () => {
    try {
      setErrorMsg("");
      setSummaryContent(null);
      setIsLoading(true);
      setOpenSummarizeDrawer(true);
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_POST_SUMMARY,
        {
          content: blogPostData.content || "",
        }
      );
      if (aiResponse.data) setSummaryContent(aiResponse.data);
    } catch (error) {
      setSummaryContent(null);
      setErrorMsg(
        "Something went wrong when generate summary. Please try again."
      );
      console.error("Error generating blog post summary:", error);
    } finally {
      setIsLoading(false);
    }
  };
  //increment views
  const incrementViews = async (postId) => {
    if (!postId) return;
    try {
      const response = await axiosInstance.post(
        API_PATHS.POSTS.INCREMENT_VIEW(postId)
      );
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };
  //handle canceling a reply
  const handleCancelReply = () => {
    setReplyText("");
    setShowReplyForm(false);
  };
  //add reply
  const handleAddReply = async () => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.COMMENTS.ADD(blogPostData._id),
        {
          content: replyText,
          parentComment: "",
        }
      );
      toast.success("Reply added successfully");
      setReplyText("");
      setShowReplyForm(false);
      fetchCommentsByPostId(blogPostData._id);
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Something went wrong when add reply. Please try again.");
    }
  };
  useEffect(() => {
    fetchPostDetailsBySlug();
    return () => {};
  }, [slug]);
  return (
    <BlogLayOut>
      <>
        <title>{blogPostData?.title}</title>
        <meta name="description" content={blogPostData?.title} />
        <meta name="og:title" content={blogPostData?.title} />
        <meta name="og:imag" content={blogPostData?.coverImageUrl} />
        <meta name="og:type" content="article" />
        <div className="grid grid-cols-12 gap-8 relative">
          <div className="col-span-12 md:col-span-8 relative">
            <h1 className="text-lg md:text-2xl font-black mb-2 line-clamp-3">
              {blogPostData?.title}
            </h1>
            <div className="flex items-center gap-1 flex-wrap mt-3 mb-5">
              <span className="text-[13px] text-gray-500 font-medium">
                {moment(blogPostData?.updatedAt).format("MMM DD YYYY")}
              </span>
              <LuDot className="text-xl text-gray-500" />
              <div className="flex items-center flex-wrap gap-2">
                {blogPostData?.tags.slice(0, 3).map((tag, index) => (
                  <button
                    key={index}
                    className="bg-sky-200/50 text-sky-800/80 text-xs font-medium px-3 py-0.5 rounded-full text-nowrap cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tag/${tag}`);
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
              <LuDot className="text-xl text-gray-500" />
              <button
                className="flex items-center gap-2 bg-linear-to-r from-sky-500 to-cyan-400 text-xs text-white font-medium px-3 py-0.5 rounded-full text-nowrap cursor-pointer hover:scale-[1.02] transition-all my-1"
                onClick={generateBlogPostSummary}
              >
                <LuSparkles />
                Summarize Post
              </button>
            </div>
            <img
              src={blogPostData?.coverImageUrl}
              alt={blogPostData?.title}
              className="w-full h-96 object-cover mb-6 rounded-lg"
            />
            <div>
              <MarkdownContent
                content={sanitizeMarkdown(blogPostData?.content || "")}
              />
              <SharePost title={blogPostData?.title} />
              <div className="bg-gray-50 p-5 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  {/* Left section: Heading + vertical divider + comment count */}
                  <div className="flex items-center gap-4">
                    <h4 className="text-lg font-semibold">Comments</h4>
                    <div className="h-4 w-px bg-gray-400" />
                    <div className="flex items-center gap-2 text-gray-700">
                      <LuMessageCircleDashed className="text-xl" />
                      <span className="text-sm font-medium">
                        {comments?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Right section: Like button + Add Comment button */}
                  <div className="flex items-center gap-4">
                    {blogPostData && (
                      <LikeCommentButton
                        postId={blogPostData._id}
                        likes={blogPostData.likes}
                      />
                    )}
                    <button
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-sm font-semibold text-white px-5 py-2 rounded-lg hover:bg-black hover:text-white cursor-pointer"
                      onClick={() => {
                        if (!user) {
                          setOpenAuthForm(true);
                          return;
                        }
                        setShowReplyForm(true);
                      }}
                    >
                      Add Comment
                    </button>
                  </div>
                </div>

                {showReplyForm && (
                  <div className="bg-white pt-1 pb-5 pr-8 rounded-lg mb-8">
                    <CommentReplyInput
                      user={user}
                      authorName={user?.name}
                      content=""
                      replyText={replyText}
                      setReplyText={setReplyText}
                      handleAddReply={handleAddReply}
                      handleCancelReply={handleCancelReply}
                      disableAutoGen
                      type="new"
                    />
                  </div>
                )}
                {comments?.length > 0 &&
                  comments.map((comment) => (
                    <CommentInfoCard
                      key={comment._id}
                      commentId={comment._id || null}
                      authorName={comment.author?.name}
                      authorPhoto={comment.author?.profileImageUrl}
                      content={comment.content}
                      updatedOn={
                        comment.updatedAt
                          ? moment(comment.updatedAt).format("MM DDD YYYY")
                          : "-"
                      }
                      post={comment.post}
                      replies={comment.replies || []}
                      getAllComments={() =>
                        fetchCommentsByPostId(blogPostData._id)
                      }
                      onDelete={(commentId) =>
                        setOpenDeleteAlert({
                          open: true,
                          data: commentId || comment._id,
                        })
                      }
                    />
                  ))}
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <TrendingPostSection />
          </div>
        </div>
        <Drawer
          isOpen={openSummarizeDrawer}
          onClose={() => setOpenSummarizeDrawer(false)}
          title={!isLoading && summaryContent?.title}
        >
          {errorMsg && (
            <p className="flex gap-2 text-sm text-shadow-amber-600 font-medium">
              <LuCircleAlert className="mt-1" /> {errorMsg}
            </p>
          )}
          {isLoading && <SkeletonLoader />}
          {!isLoading && summaryContent && (
            <div>
              <h3 className="font-bold text-lg mb-2">Summary</h3>
              <MarkdownContent
                content={sanitizeMarkdown(summaryContent.summary || "")}
              />
            </div>
          )}
        </Drawer>
      </>
    </BlogLayOut>
  );
};

export default BlogPostView;
