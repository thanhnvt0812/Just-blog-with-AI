/* eslint-disable no-unused-vars */
import React from "react";
import BlogNavbar from "./BlogNavbar";

const BlogLayout = ({ children, activeMenu }) => {
  return (
    <div>
      <BlogNavbar activeMenu={activeMenu} />
      <div className="container mx-auto px-5 md:px-0 mt-10">{children}</div>
    </div>
  );
};

export default BlogLayout;
