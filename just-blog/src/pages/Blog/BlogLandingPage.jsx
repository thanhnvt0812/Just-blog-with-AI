/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { LuGalleryVerticalEnd, LuLoaderCircle } from "react-icons/lu";
import FeaturedBlogPost from "./components/FeaturedBlogPost";
import BlogPostSummaryCard from "./components/BlogPostSummaryCard";
import TrendingPostSection from "./components/TrendingPostSection";

const BlogLandingPage = () => {
  const navigate = useNavigate();
  const [blogPostList, setBlogPostList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //fetch paginated blog posts
  const getAllPosts = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.POSTS.GET_ALL, {
        params: {
          status: "published",
          page: pageNumber,
        },
      });
      const { posts, totalPages } = response.data;
      setBlogPostList((prevPosts) =>
        pageNumber === 1 ? posts : [...prevPosts, ...posts]
      );
      setTotalPages(totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  };
  //get description in blog content
  const getDescription = (content = "") => {
    const lines = content.split("\n");
    const descriptionLines = [];
    let hasFoundIntro = false;
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // skip heading markdown
      if (line.startsWith("##")) continue;
      // determine the starting point: find the line containing "Introduction"
      if (!hasFoundIntro && line.toLowerCase().includes("introduction")) {
        hasFoundIntro = true;
        continue; // remove the line **Introduction:** or **Introduction**
      }
      // if you see the Introduction section, start taking the content after it.
      if (hasFoundIntro) {
        if (
          line === "" ||
          line.startsWith("**") || // ignore bold subheadings like **Some Heading**
          line.startsWith("#")
        ) {
          continue;
        }
        descriptionLines.push(line);
        if (line.endsWith(".") || descriptionLines.length >= 2) break;
      }
    }
    // if there is no **Introduction**, fallback: take the first line after the heading
    if (!hasFoundIntro && descriptionLines.length === 0) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (
          line === "" ||
          line.startsWith("#") ||
          line.startsWith("**") ||
          line.startsWith("```")
        ) {
          continue;
        }
        descriptionLines.push(line);
        if (line.endsWith(".") || descriptionLines.length >= 2) break;
      }
    }

    return descriptionLines.join(" ");
  };

  //load more blog posts
  const handleLoadMore = async () => {
    if (page < totalPages) {
      getAllPosts(page + 1);
    }
  };
  //initial load
  useEffect(() => {
    getAllPosts(1);
  }, []);
  //navigate to blog post when click
  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };
  return (
    <BlogLayout>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-9">
          {blogPostList.length > 0 && (
            <FeaturedBlogPost
              title={blogPostList[0].title}
              coverImageUrl={blogPostList[0].coverImageUrl}
              description={getDescription(blogPostList[0].content)}
              tags={blogPostList[0].tags}
              updatedOn={
                blogPostList[0].updatedAt
                  ? moment(blogPostList[0].updatedAt).format("MMM DD YYYY")
                  : "-"
              }
              authorName={blogPostList[0].author.name}
              authorProfileImage={blogPostList[0].author.profileImageUrl}
              onClick={() => handleClick(blogPostList[0])}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {blogPostList.length > 0 &&
              blogPostList
                .slice(1)
                .map((post) => (
                  <BlogPostSummaryCard
                    key={post._id}
                    title={post.title}
                    coverImageUrl={post.coverImageUrl}
                    description={getDescription(post.content)}
                    tags={post.tags}
                    updatedOn={
                      post.updatedAt
                        ? moment(post.updatedAt).format("MMM DD YYYY")
                        : "-"
                    }
                    authorName={post.author.name}
                    authorProfileImage={post.author.profileImageUrl}
                    onClick={() => handleClick(post)}
                  />
                ))}
          </div>
          {page < totalPages && (
            <div className="flex items-center justify-center mt-5">
              <button
                className="flex items-center gap-3 text-sm text-white font-medium bg-black px-7 py-2.5 mt-6 rounded-full text-nowrap hover:scale-105 transition-all cursor-pointer"
                disabled={isLoading}
                onClick={handleLoadMore}
              >
                {isLoading ? (
                  <LuLoaderCircle className="animate-spin text-[15px]" />
                ) : (
                  <LuGalleryVerticalEnd className="text-[15px]" />
                )}{" "}
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
        <div className="col-span-12 md:col-span-3">
          <TrendingPostSection />
        </div>
      </div>
    </BlogLayout>
  );
};

export default BlogLandingPage;
