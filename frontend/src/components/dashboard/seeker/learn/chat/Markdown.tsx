import { memo } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components, Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { CodeBlock } from './CodeBlock';

const REMARK_PLUGINS: Options['remarkPlugins'] = [remarkGfm, remarkMath];
const STREAMING_REHYPE_PLUGINS: Options['rehypePlugins'] = [];
const REHYPE_PLUGINS: Options['rehypePlugins'] = [
  [rehypeHighlight, { detect: true }],
  [rehypeKatex, { throwOnError: false, strict: false }],
];

const components: Components = {
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const language = /language-(\w+)/.exec(className ?? '')?.[1] ?? null;
    const raw = textOf(children);
    if (!language && !raw.includes('\n')) return <code className="learning-md__inline-code">{children}</code>;

    return (
      <CodeBlock language={language} code={raw.replace(/\n$/, '')}>
        <code className={className}>{children}</code>
      </CodeBlock>
    );
  },
  a: ({ href, children }) => {
    const external = /^https?:\/\//i.test(href ?? '');
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="learning-md__table-wrap">
      <table>{children}</table>
    </div>
  ),
};

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

export const Markdown = memo(function Markdown({ content, streaming = false }: { content: string; streaming?: boolean }) {
  return (
    <div className={`learning-md${streaming ? ' is-streaming' : ''}`}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={streaming ? STREAMING_REHYPE_PLUGINS : REHYPE_PLUGINS}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
