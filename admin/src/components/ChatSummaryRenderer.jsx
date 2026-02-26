import React from 'react';
import ReactMarkdown from 'react-markdown';

const ChatSummaryRenderer = ({ summary }) => {
  if (!summary) return null;

  // Process the markdown to handle nested lists better and format it according to common markdown syntax
  const processedSummary = summary
    // Convert double asterisks headers to proper markdown headers
    .replace(/^\*\*(.*?):\*\*/gm, '## $1:')
    .replace(/^\*\*(.*?)\*\*$/gm, '## $1')
    // Convert nested list items with proper indentation
    .replace(/\n   - /g, '\n  - ')
    // Format assessment titles as headers
    .replace(/^([0-9]+)\. \*\*(.*?)\*\*:/gm, '### $1. $2:')
    .replace(/^([0-9]+)\. \*\*(.*?)\*\*$/gm, '### $1. $2');

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
      <div className="text-sm text-gray-700 leading-relaxed">
        <ReactMarkdown
          components={{
            // Headers
            h1: ({ ...props }) => <h1 className="text-xl font-bold text-indigo-800 mt-4 mb-2" {...props} />,
            h2: ({ ...props }) => <h2 className="text-lg font-bold text-indigo-700 mt-3 mb-2" {...props} />,
            h3: ({ ...props }) => <h3 className="text-base font-semibold text-indigo-600 mt-2 mb-1" {...props} />,
            h4: ({ ...props }) => <h4 className="font-semibold text-indigo-600 mt-2 mb-1" {...props} />,
            
            // Paragraphs and text
            p: ({ ...props }) => <p className="my-2" {...props} />,
            strong: ({ ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
            em: ({ ...props }) => <em className="text-indigo-800 italic" {...props} />,
            
            // Lists
            ul: ({ ...props }) => <ul className="my-2 space-y-1" {...props} />,
            ol: ({ ...props }) => <ol className="my-2 pl-5 list-decimal space-y-1" {...props} />,
            li: ({ ordered, ...props }) => (
              <li className="flex items-start gap-2 my-1">
                {!ordered && <div className="min-w-[6px] h-[6px] rounded-full bg-indigo-400 mt-2"></div>}
                <div className="flex-1">{props.children}</div>
              </li>
            ),
            
            // Other elements
            hr: ({ ...props }) => <hr className="my-3 border-indigo-200" {...props} />,
            blockquote: ({ ...props }) => (
              <blockquote className="border-l-4 border-indigo-200 pl-3 my-2 italic text-gray-600" {...props} />
            ),
            
            // Handle potential code blocks
            code: ({ inline, ...props }) => 
              inline ? 
                <code className="px-1 py-0.5 bg-gray-100 rounded text-indigo-600 font-mono text-xs" {...props} /> : 
                <pre className="bg-gray-100 p-2 rounded my-2 overflow-auto">
                  <code className="text-indigo-600 font-mono text-xs" {...props} />
                </pre>
          }}
        >
          {processedSummary}
        </ReactMarkdown>
      </div>
    </div>
  );
};


export default ChatSummaryRenderer;