import ReactMarkdown from 'react-markdown';
import type { Components, Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const REMARK_PLUGINS: Options['remarkPlugins'] = [remarkGfm, remarkMath];
const REHYPE_PLUGINS: Options['rehypePlugins'] = [[rehypeKatex, { throwOnError: false, strict: false }]];

const MARKDOWN_COMPONENTS: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0a65cc] underline-offset-2 hover:underline">
      {children}
    </a>
  ),
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  h1: ({ children }) => <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-3 mb-1.5 text-sm font-semibold first:mt-0">{children}</h4>,
  code: ({ children }) => <code className="rounded bg-[#f1f2f4] px-1 py-0.5 text-[13px]">{children}</code>,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-[#e4e5e8] bg-[#f7f8f9] px-2.5 py-1.5 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-[#e4e5e8] px-2.5 py-1.5 align-top">{children}</td>,
};

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#0a65cc] px-4 py-2.5 text-[15px] leading-7 whitespace-pre-wrap text-white">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e4e5e8] bg-white px-5 py-4 text-[15px] leading-7 break-words text-[#18191c] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
