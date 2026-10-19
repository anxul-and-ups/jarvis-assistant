import React, { useState } from 'react';
import { marked, Tokens } from 'marked';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-cyan-900/40 bg-zinc-950 text-zinc-100 text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
        <span className="text-[11px] font-medium uppercase tracking-wider text-cyan-300">
          {lang || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-cyan-300 transition-colors py-0.5 px-2 rounded hover:bg-zinc-800"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px] font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed text-zinc-200 selection:bg-cyan-950">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  let tokens: Tokens.Generic[];
  try {
    tokens = marked.lexer(content) as Tokens.Generic[];
  } catch {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="space-y-2.5 text-[14px] leading-relaxed text-zinc-200 break-words">
      {tokens.map((token, idx) => (
        <TokenItem key={idx} token={token} />
      ))}
    </div>
  );
}

function TokenItem({ token }: { token: Tokens.Generic }) {
  switch (token.type) {
    case 'code':
      return <CodeBlock code={(token as Tokens.Code).text} lang={(token as Tokens.Code).lang} />;

    case 'heading': {
      const heading = token as Tokens.Heading;
      const text = heading.text;
      if (heading.depth === 1) {
        return (
          <h1 className="text-lg font-bold text-white font-mono mt-4 mb-2 tracking-wide">
            <InlineContent text={text} />
          </h1>
        );
      }
      if (heading.depth === 2) {
        return (
          <h2 className="text-base font-semibold text-cyan-300 font-mono mt-3 mb-1.5 tracking-wide">
            <InlineContent text={text} />
          </h2>
        );
      }
      return (
        <h3 className="text-[14px] font-semibold text-zinc-100 font-mono mt-2 mb-1">
          <InlineContent text={text} />
        </h3>
      );
    }

    case 'paragraph':
      return (
        <p className="leading-relaxed">
          <InlineContent text={(token as Tokens.Paragraph).text} />
        </p>
      );

    case 'list': {
      const listToken = token as Tokens.List;
      const ListTag = listToken.ordered ? 'ol' : 'ul';
      const listStyle = listToken.ordered ? 'list-decimal' : 'list-disc';
      return (
        <ListTag className={`pl-5 my-2 space-y-1 ${listStyle}`}>
          {listToken.items.map((item: Tokens.ListItem, itemIdx: number) => (
            <li key={itemIdx} className="leading-relaxed text-zinc-300">
              <InlineContent text={item.text} />
            </li>
          ))}
        </ListTag>
      );
    }

    case 'blockquote':
      return (
        <blockquote className="border-l-2 border-cyan-400 pl-3.5 my-2 italic text-zinc-400 bg-zinc-950/60 py-1.5 rounded-r">
          <InlineContent text={(token as Tokens.Blockquote).text} />
        </blockquote>
      );

    case 'table': {
      const tableToken = token as Tokens.Table;
      return (
        <div className="my-3 overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-900/90 border-b border-zinc-800 font-semibold text-cyan-300 font-mono">
              <tr>
                {tableToken.header.map((col: Tokens.TableCell, cIdx: number) => (
                  <th key={cIdx} className="py-2.5 px-3">
                    <InlineContent text={col.text} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {tableToken.rows.map((row: Tokens.TableCell[], rIdx: number) => (
                <tr key={rIdx} className="hover:bg-zinc-850/50">
                  {row.map((cell: Tokens.TableCell, cIdx: number) => (
                    <td key={cIdx} className="py-2 px-3 text-zinc-300">
                      <InlineContent text={cell.text} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'hr':
      return <hr className="my-4 border-zinc-800" />;

    case 'space':
      return null;

    default:
      if ('text' in token && typeof (token as any).text === 'string') {
        return (
          <p className="leading-relaxed">
            <InlineContent text={(token as any).text} />
          </p>
        );
      }
      return null;
  }
}

// Parses inline markdown elements: **bold**, *italic*, `inline code`, [link](url)
function InlineContent({ text }: { text: string }) {
  if (!text) return null;

  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, pIdx) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code
              key={pIdx}
              className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono text-[13px] border border-cyan-900/40"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        return <FormattedText key={pIdx} rawText={part} />;
      })}
    </>
  );
}

function FormattedText({ rawText }: { rawText: string }) {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const segments = rawText.split(regex);

  return (
    <>
      {segments.map((segment, sIdx) => {
        if (segment.startsWith('**') && segment.endsWith('**') && segment.length >= 4) {
          return (
            <strong key={sIdx} className="font-semibold text-white">
              {segment.slice(2, -2)}
            </strong>
          );
        }
        if (segment.startsWith('*') && segment.endsWith('*') && segment.length >= 2) {
          return <em key={sIdx} className="italic text-cyan-200/90">{segment.slice(1, -1)}</em>;
        }
        const linkMatch = segment.match(/^\[([^\]]+)\]\([^)]+\)$/);
        if (linkMatch) {
          return (
            <a
              key={sIdx}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              {linkMatch[1]}
            </a>
          );
        }
        return <React.Fragment key={sIdx}>{segment}</React.Fragment>;
      })}
    </>
  );
}
