/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { LuCopy, LuCheck, LuCode } from "react-icons/lu";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownContent = ({ content }) => {
  if (!content) return null;

  return (
    <div className="">
      <div className="text[14px] prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkDown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";
              const isInline = !className;
              return !isInline ? (
                <CodeBlock
                  code={String(children).replace(/\n$/, "")}
                  language={language}
                />
              ) : (
                <code
                  className="px-1 py-0.5 bg-sky-50 rounded text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            p({ children }) {
              return <p className="mb-4 leading-[22px]">{children}</p>;
            },
            strong({ children }) {
              return <strong className="">{children}</strong>;
            },
            em({ children }) {
              return <em className="">{children}</em>;
            },
            ul({ children }) {
              return (
                <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>
              );
            },
            ol({ children }) {
              return (
                <ol className="list-decimal pl6 space-y-2 my-4">{children}</ol>
              );
            },
            li({ children }) {
              return <li className="mb-2 leading-[22px]">{children}</li>;
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4">
                  {children}
                </blockquote>
              );
            },
            h1({ children }) {
              return (
                <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
              );
            },
            h2({ children }) {
              return (
                <h2 className="text-left font-bold mt-6 mb-3">{children}</h2>
              );
            },
            h3({ children }) {
              return (
                <h3 className="text-lg font-bold mt-5 mb-2">{children}</h3>
              );
            },
            h4({ children }) {
              return (
                <h4 className="text-base font-black mt-4 mb-2">{children}</h4>
              );
            },
            a({ children, href }) {
              return (
                <a href={href} className="text-blue-600 hover:underline">
                  {children}
                </a>
              );
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full divide-y divide-gray-300 border-gray-200">
                    {children}
                  </table>
                </div>
              );
            },
            thead({ children }) {
              return <thead className="bg-gray-50">{children}</thead>;
            },
            tbody({ children }) {
              return (
                <tbody className="divide-y divide-gray-200">{children}</tbody>
              );
            },
            tr({ children }) {
              return <tr className="">{children}</tr>;
            },
            th({ children }) {
              return (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {children}
                </td>
              );
            },
            hr() {
              return <hr className="my-6 border-gray-200" />;
            },
            img({ src, alt }) {
              return (
                <img src={src} alt={alt} className="my-4 max-w-full rounded" />
              );
            },
          }}
        >
          {content}
        </ReactMarkDown>
      </div>
    </div>
  );
};

export default MarkdownContent;
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <div className="relative my-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <LuCode size={16} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {language || "Code"}
          </span>
        </div>
        <button
          onClick={copyCode}
          className="text-gray-500 hover:text-gray-700 focus:outline-none relative group:"
          aria-label="Copy code"
        >
          {copied ? (
            <LuCheck size={16} className="text-green-500" />
          ) : (
            <LuCopy size={16} className="" />
          )}
          {copied && (
            <span className="absolute -top-8 right-0 bg-black text-white text-xs rounded-md px-2 py-1 opacity-80 group-hover:opacity-100 transition">
              Copied
            </span>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          fontSize: 12.5,
          margin: 0,
          padding: "1rem",
          background: "transparent",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
