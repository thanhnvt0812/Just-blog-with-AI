/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate, useSearchParams } from "react-router-dom";
import BlogPostSummaryCard from "./components/BlogPostSummaryCard";
import moment from "moment";

const SearchPosts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [searchResult, setSearchResult] = useState([]);
  const handleSearch = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.POSTS.SEARCH, {
        params: {
          q: query,
        },
      });
      if (response.data) setSearchResult(response.data || []);
    } catch (error) {
      console.error("Error searching blog posts:", error);
    }
  };
  const handlePostClick = (post) => {
    navigate(`/${post.slug}`);
  };
  useEffect(() => {
    handleSearch();
    return () => {};
  }, [query]);
  return (
    <BlogLayout>
      <div>
        <h3 className="text-lg font-medium ">
          Show search results matching "
          <span className="font-semibold">{query}</span>"
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {searchResult.length > 0 &&
            searchResult.map((post) => (
              <BlogPostSummaryCard
                key={post._id}
                title={post.title}
                coverImageUrl={post.coverImageUrl}
                description={post.content}
                tags={post.tags}
                updatedOn={
                  post.updatedAt
                    ? moment(post.updatedAt).format("MMM DD YYYY")
                    : "-"
                }
                authorName={post.author.name}
                authorProfileImage={post.author.profileImageUrl}
                onClick={() => handlePostClick(post)}
              />
            ))}
        </div>
      </div>
    </BlogLayout>
  );
};

export default SearchPosts;
