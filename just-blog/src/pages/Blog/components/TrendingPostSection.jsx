/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import { useNavigate } from "react-router-dom";

const TrendingPostSection = () => {
  const navigate = useNavigate();
  const [postList, setPostList] = useState([]);
  //fetch trending blog posts
  const getTrendingPosts = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.POSTS.GET_TRENDING_POSTS
      );
      setPostList(response?.data.length > 0 ? response?.data : []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    }
  };
  //handle post click
  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };
  useEffect(() => {
    getTrendingPosts();
    return () => {};
  }, []);
  return (
    <div>
      <h4 className="text-base text-black font-medium mb-3">Recent Posts</h4>
      {postList?.length > 0 &&
        postList.map((post) => (
          <PostCard
            key={post._id}
            title={post.title}
            coverImageUrl={post.coverImageUrl}
            tags={post.tags}
            handleClick={() => handleClick(post)}
          />
        ))}
    </div>
  );
};

export default TrendingPostSection;
const PostCard = ({ title, coverImageUrl, tags, handleClick }) => {
  return (
    <div className="cursor-pointer mb-3" onClick={handleClick}>
      <div className="flex items-center gap-4 mt-2">
        <img
          src={coverImageUrl}
          alt={title}
          className="w-14 h-14 object-cover rounded"
        />
        <h2 className="text-sm md:text-sm font-medium mb-2 line-clamp-3">
          {title}
        </h2>
      </div>
    </div>
  );
};
