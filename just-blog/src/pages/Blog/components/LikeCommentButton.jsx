import React, { useState } from "react";
import { LuMessageCircleDashed } from "react-icons/lu";
import { PiHandsClapping } from "react-icons/pi";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import clsx from "clsx";

const LikeCommentButton = ({ postId, likes }) => {
  const [postLikes, setPostLikes] = useState(likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLikeClick = async () => {
    if (!postId) return;
    try {
      const response = await axiosInstance.post(API_PATHS.POSTS.LIKE(postId));
      if (response.data) {
        setPostLikes((prev) => prev + 1);
        setLiked(true);
        setTimeout(() => setLiked(false), 500);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <button
        className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-cyan-600"
        onClick={handleLikeClick}
      >
        <PiHandsClapping
          className={clsx(
            "text-xl transition-transform duration-300",
            liked && "scale-125 text-cyan-500"
          )}
        />
        <span className="text-sm font-medium">{postLikes}</span>
      </button>
    </div>
  );
};

export default LikeCommentButton;
