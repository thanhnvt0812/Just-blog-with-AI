/* eslint-disable no-unused-vars */
import React from "react";
import CustomPieChart from "../Charts/CustomPieChart";

const COLORS = [
  "#3366CC", // blue
  "#DC3912", // red
  "#FF9900", // orange
  "#109618", // green
  "#990099", // orange
  "#0099C6", // turquoise
  "#DD4477", // dark pink
];
const TagCloud = ({ tags }) => {
  const maxCount = Math.max(...tags.map((item) => item.count), 1);
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const fontSize = 12 + (tag.count / maxCount) * 5;
        return (
          <span
            key={tag.name}
            className="font-medium text-sky-900/80 bg-sky-100 px-3 py-0.5 rounded-lg "
            style={{ fontSize: `${fontSize}px` }}
          >
            #{tag.name}
          </span>
        );
      })}
    </div>
  );
};
const TagInsights = ({ tagUsage }) => {
  const processedData = (() => {
    if (!tagUsage) return [];
    const sorted = [...tagUsage].sort((a, b) => b.count - a.count);
    const topFour = sorted.slice(0, 4);
    const others = sorted.slice(4);
    const othersCount = others.reduce((sum, item) => sum + item.count, 0);
    const finalData = topFour.map((item) => ({
      ...item,
      name: item.tag || "",
    }));
    if (othersCount > 0) {
      finalData.push({
        name: "Others",
        count: othersCount,
      });
    }
    return finalData;
  })();
  return (
    <div className="grid grid-cols-12 mt-4">
      <div className="col-span-12 md:col-span-7 min-h-[300px]">
        <CustomPieChart data={processedData} colors={COLORS} />
      </div>
      <div className="col-span-12 md:col-span-5 mt-5 md:mt-0">
        <TagCloud
          tags={
            tagUsage
              .slice(0, 15)
              .map((item) => ({ ...item, name: item.tag || "" })) || []
          }
        />
      </div>
    </div>
  );
};

export default TagInsights;
