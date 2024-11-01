import React from 'react';
import { Terminal, Folder, File, X } from 'lucide-react';

export function TerminalHeader() {
  return (
    <div className="bg-gray-700 p-3 flex items-center gap-2">
      <Terminal className="w-5 h-5 text-gray-300" />
      <div className="flex-1 text-gray-300 text-sm font-mono">Terminal</div>
      <div className="flex gap-2">
        <button className="p-1 hover:bg-gray-600 rounded">
          <Folder className="w-4 h-4 text-gray-300" />
        </button>
        <button className="p-1 hover:bg-gray-600 rounded">
          <File className="w-4 h-4 text-gray-300" />
        </button>
        <button className="p-1 hover:bg-gray-600 rounded">
          <X className="w-4 h-4 text-gray-300" />
        </button>
      </div>
    </div>
  );
}