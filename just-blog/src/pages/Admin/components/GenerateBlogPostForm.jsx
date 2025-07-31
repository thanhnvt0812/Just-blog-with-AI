/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Inputs/Input";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import { LuLoaderCircle } from "react-icons/lu";

const GenerateBlogPostForm = ({
  contentParams,
  setPostContent,
  handleCloseForm,
}) => {
  const [formData, setFormData] = useState({
    title: contentParams?.title || "",
    tone: contentParams?.tone || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleChange = (key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };
  const handleGenerateBlogPost = async (e) => {
    e.preventDefault();
    const { title, tone } = formData;
    if (!title || !tone) {
      setError("Please fill all the required fields");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      //call api generate blog post by ai
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_BLOG_POST,
        { title, tone }
      );
      const generatedPost = aiResponse.data;
      setPostContent(title, generatedPost.rawText || "");
      handleCloseForm();
    } catch (error) {
      if (error.response && error.response.data.message)
        setError(error.response.data.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-[70vw] md:w0[35vw] p-7 flex-col justify-center">
      <h3 className="text-[24px] font-bold text-black">Generate Blog Post</h3>
      <p className="text-lg text-slate-700 mt-[5px] mb-3">
        Provide a title and tone to generate your blog post
      </p>
      <form onSubmit={handleGenerateBlogPost} className="flex flex-col gap-3">
        <Input
          value={formData.title}
          onChange={(e) => handleChange("title", e)}
          label="Blog Post Title"
          placeholder=""
          type="text"
        />
        <Input
          value={formData.tone}
          onChange={(e) => handleChange("tone", e)}
          label="Tone of Blog Post"
          placeholder="beginner friendly, technical, casual, etc."
          type="text"
        />
        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
        <div className="flex justify-center">
          <button
            type="submit"
            className="btn-primary max-w-[240px] w-full mt-2"
            disabled={isLoading}
          >
            {isLoading && (
              <LuLoaderCircle className="animate-spin text-[18px]" />
            )}{" "}
            {isLoading ? "Generating..." : "Generate Blog Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateBlogPostForm;
