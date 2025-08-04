import React from "react";
import { LuHeart } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const TopPostsCard = ({
  title,
  coverImageUrl,
  views,
  likes,
  maxViews,
  slug,
}) => {
  const navigate = useNavigate();
  const viewPercentage = ((views / maxViews) * 100).toFixed(0);
  return (
    <div className="bg-white py-4 flex flex-col gap-3 border-b border-gray-100">
      <div className="flex items-start gap-2">
        <img
          src={coverImageUrl}
          alt={title}
          className="w-10 h-10 rounded-md object-cover"
        />
        <h3
          className="text-sm font-medium text-gray-800 line-clamp-2 cursor-pointer"
          onClick={() => navigate(`/${slug}`)}
        >
          {title}
        </h3>
      </div>
      <div className="relative w-full h-1.5 bg-sky-100/60 rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-linear-to-r from-sky-700 to-cyan-400 rounded-full transition-all"
          style={{ width: `${viewPercentage}%` }}
        ></div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1 text-sm text-black">
          {views} views
        </span>
        <span className="flex items-center gap-1 text-sm text-black">
          <LuHeart className="text-[16px] text-gray-500" />
          {likes} likes
        </span>
      </div>
    </div>
  );
};

export default TopPostsCard;
