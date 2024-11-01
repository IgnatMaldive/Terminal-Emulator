import React, { useState, useRef, useEffect } from 'react';
import { TerminalHeader } from './components/TerminalHeader';
import { TerminalOutput } from './components/TerminalOutput';
import { useFileSystem } from './hooks/useFileSystem';
import { createCommands } from './utils/commands';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>(['Welcome to WebTerminal v1.0.0', 'Type "help" for available commands']);
  const [currentDir, setCurrentDir] = useState('/home');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const { fs, setFs } = useFileSystem();

  const commands = createCommands(setOutput, fs, setFs, currentDir, setCurrentDir);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
    inputRef.current?.focus();
  }, [output]);

  const handleCommand = (cmd: string) => {
    const [command, ...args] = cmd.trim().split(' ');
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    if (command in commands) {
      commands[command](args);
    } else if (command) {
      setOutput(prev => [...prev, `${command}: command not found`]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setOutput(prev => [...prev, `${currentDir}$ ${input}`]);
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <TerminalHeader />
        <div ref={outputRef}>
          <TerminalOutput
            output={output}
            currentDir={currentDir}
            input={input}
            onInputChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
}

export default App;