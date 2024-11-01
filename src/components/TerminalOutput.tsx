import React from 'react';

interface Props {
  output: string[];
  currentDir: string;
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const formatLine = (line: string) => {
  return line.split(/((?:<dir>.*?<\/dir>)|(?:<file>.*?<\/file>))/).map((part, index) => {
    if (part.startsWith('<dir>')) {
      const content = part.replace(/<\/?dir>/g, '');
      return <span key={index} className="text-blue-400 font-bold">{content}</span>;
    }
    if (part.startsWith('<file>')) {
      const content = part.replace(/<\/?file>/g, '');
      return <span key={index} className="text-gray-200">{content}</span>;
    }
    return <span key={index} className="text-gray-200">{part}</span>;
  });
};

export function TerminalOutput({ output, currentDir, input, onInputChange, onKeyDown, inputRef }: Props) {
  return (
    <div className="p-4 h-[500px] overflow-y-auto font-mono text-sm">
      {output.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap">{formatLine(line)}</div>
      ))}
      <div className="flex items-center text-green-400">
        <span>{currentDir}$ </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent outline-none ml-2 text-gray-200"
          autoFocus
        />
      </div>
    </div>
  );
}