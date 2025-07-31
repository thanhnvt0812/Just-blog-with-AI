import { GoogleGenAI } from "@google/genai";
import {
  blogPostIdeasPrompt,
  generateReplyPrompt,
  blogSummaryPrompt,
} from "../utils/prompts.js";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//---------------------------------------------
// @desc Generate blog content from title
// @route POST /api/ai/generate
// @access Private
//---------------------------------------------
export const generateBlogPost = async (req, res) => {
  try {
    const { title, tone } = req.body;
    if (!title || !tone)
      return res.status(400).json({ message: "Missing title or tone" });
    const prompt = `Write a markdown-formatted blog post titled "${title}" with a tone of "${tone}". Include  an introduction, subheadings, code examples if relevant, and a conclusion.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    let rawText = response.text;
    res.status(200).json({ rawText });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to generate blog post", error: error.message });
  }
};
//---------------------------------------------
// @desc Generate blog post ideas from title
// @route POST /api/ai/generate-ideas
// @access Private
//---------------------------------------------
export const generateBlogPostIdeas = async (req, res) => {
  try {
    const { topics } = req.body;
    if (!topics) return res.status(400).json({ message: "Missing topics" });
    const prompt = blogPostIdeasPrompt(topics);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    let rawText = response.text;
    // clear it: remove ```json and ``` from beginning and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") //remove starting ```json
      .replace(/```$/, "") //remove ending ```
      .trim(); //remove leading and trailing spaces
    const data = JSON.parse(cleanedText);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate blog post ideas",
      error: error.message,
    });
  }
};
//---------------------------------------------
// @desc Generate comment reply
// @route POST /api/ai/generate-reply
// @access Private
//---------------------------------------------
export const generateCommentReply = async (req, res) => {
  try {
    const { author, content } = req.body;
    if (!content) return res.status(400).json({ message: "Missing content" });
    const prompt = generateReplyPrompt({ author, content });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    let rawText = response.text;
    res.status(200).json(rawText);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate comment reply",
      error: error.message,
    });
  }
};
//---------------------------------------------
// @desc Generate blog post summary
// @route POST /api/ai/generate-summary
// @access Private
//---------------------------------------------
export const generatePostSummary = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Missing content" });
    const prompt = blogSummaryPrompt(content);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    let rawText = response.text;
    // clear it: remove ```json and ``` from beginning and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") //remove starting ```json
      .replace(/```$/, "") //remove ending ```
      .trim(); //remove leading and trailing spaces
    const data = JSON.parse(cleanedText);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate blog post summary",
      error: error.message,
    });
  }
};
