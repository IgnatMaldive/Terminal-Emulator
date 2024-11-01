import { useState, useEffect } from 'react';
import { FileSystem } from '../types/terminal';

const DEFAULT_FS: FileSystem = {
  '/home': { type: 'directory' },
  '/home/readme.txt': { type: 'file', content: 'Welcome to WebTerminal!\nThis is a simple text file.' },
  '/home/documents': { type: 'directory' },
  '/home/downloads': { type: 'directory' }
};

export function useFileSystem() {
  const [fs, setFs] = useState<FileSystem>(() => {
    const saved = localStorage.getItem('fileSystem');
    return saved ? JSON.parse(saved) : DEFAULT_FS;
  });

  useEffect(() => {
    localStorage.setItem('fileSystem', JSON.stringify(fs));
  }, [fs]);

  return { fs, setFs };
}