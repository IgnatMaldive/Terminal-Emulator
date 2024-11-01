import { Commands, FileSystem } from '../types/terminal';

const isValidPath = (path: string) => /^[a-zA-Z0-9/_.-]+$/.test(path);

const formatDirectory = (name: string) => `<dir>${name}/</dir>`;
const formatFile = (name: string) => `<file>${name}</file>`;

export function createCommands(
  setOutput: React.Dispatch<React.SetStateAction<string[]>>,
  fs: FileSystem,
  setFs: React.Dispatch<React.SetStateAction<FileSystem>>,
  currentDir: string,
  setCurrentDir: React.Dispatch<React.SetStateAction<string>>
): Commands {
  const resolvePath = (path: string): string => {
    if (path.startsWith('/')) return path;
    if (path === '..') {
      const parts = currentDir.split('/');
      return parts.length > 2 ? parts.slice(0, -1).join('/') : '/';
    }
    if (path === '.') return currentDir;
    return `${currentDir}/${path}`.replace(/\/+/g, '/');
  };

  return {
    help: () => {
      setOutput(prev => [...prev,
        'Available commands:',
        'ls [dir] - List directory contents',
        'cd <dir> - Change directory',
        'pwd - Print working directory',
        'mkdir <dir> - Create directory',
        'touch <file> - Create file',
        'rm <path> - Remove file or directory',
        'cat <file> - Display file contents',
        'echo <text> [> file] - Display text or write to file',
        'clear - Clear terminal',
        'tree - Display directory structure'
      ]);
    },

    ls: (args) => {
      const path = args.length > 0 ? resolvePath(args[0]) : currentDir;
      const contents = Object.entries(fs)
        .filter(([filePath]) => {
          const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
          return parentPath === path;
        })
        .map(([filePath]) => {
          const name = filePath.split('/').pop() || '';
          return fs[filePath].type === 'directory' ? formatDirectory(name) : formatFile(name);
        })
        .sort((a, b) => {
          const aIsDir = a.includes('</dir>');
          const bIsDir = b.includes('</dir>');
          if (aIsDir && !bIsDir) return -1;
          if (!aIsDir && bIsDir) return 1;
          return a.localeCompare(b);
        });
      
      setOutput(prev => [...prev, contents.join('    ') || '']);
    },

    cd: (args) => {
      if (!args.length) {
        setCurrentDir('/home');
        return;
      }
      const newPath = resolvePath(args[0]);
      if (fs[newPath]?.type === 'directory') {
        setCurrentDir(newPath);
      } else {
        setOutput(prev => [...prev, `cd: ${args[0]}: No such directory`]);
      }
    },

    mkdir: (args) => {
      if (!args.length) {
        setOutput(prev => [...prev, 'mkdir: missing operand']);
        return;
      }
      const path = resolvePath(args[0]);
      if (!isValidPath(path)) {
        setOutput(prev => [...prev, 'mkdir: invalid path']);
        return;
      }
      if (fs[path]) {
        setOutput(prev => [...prev, `mkdir: cannot create directory '${args[0]}': File exists`]);
        return;
      }
      setFs(prev => ({ ...prev, [path]: { type: 'directory' } }));
      setOutput(prev => [...prev, `Created directory ${formatDirectory(args[0])}`]);
    },

    touch: (args) => {
      if (!args.length) {
        setOutput(prev => [...prev, 'touch: missing operand']);
        return;
      }
      const path = resolvePath(args[0]);
      if (!isValidPath(path)) {
        setOutput(prev => [...prev, 'touch: invalid path']);
        return;
      }
      if (fs[path]) {
        setOutput(prev => [...prev, `touch: cannot create file '${args[0]}': File exists`]);
        return;
      }
      setFs(prev => ({ ...prev, [path]: { type: 'file', content: '' } }));
      setOutput(prev => [...prev, `Created file ${formatFile(args[0])}`]);
    },

    rm: (args) => {
      if (!args.length) {
        setOutput(prev => [...prev, 'rm: missing operand']);
        return;
      }
      const path = resolvePath(args[0]);
      if (!fs[path]) {
        setOutput(prev => [...prev, `rm: cannot remove '${args[0]}': No such file or directory`]);
        return;
      }
      const newFs = { ...fs };
      delete newFs[path];
      if (fs[path].type === 'directory') {
        Object.keys(newFs).forEach(key => {
          if (key.startsWith(path + '/')) {
            delete newFs[key];
          }
        });
      }
      setFs(newFs);
    },

    cat: (args) => {
      if (!args.length) {
        setOutput(prev => [...prev, 'cat: missing operand']);
        return;
      }
      const path = resolvePath(args[0]);
      const file = fs[path];
      if (!file || file.type !== 'file') {
        setOutput(prev => [...prev, `cat: ${args[0]}: No such file`]);
        return;
      }
      setOutput(prev => [...prev, file.content || '']);
    },

    echo: (args) => {
      if (args.length === 0) {
        setOutput(prev => [...prev, '']);
        return;
      }

      const redirectIndex = args.indexOf('>');
      if (redirectIndex === -1) {
        setOutput(prev => [...prev, args.join(' ')]);
        return;
      }

      // Handle redirection
      const content = args.slice(0, redirectIndex).join(' ');
      const fileName = args[redirectIndex + 1]?.trim();

      if (!fileName) {
        setOutput(prev => [...prev, 'echo: no file specified for redirection']);
        return;
      }

      const filePath = resolvePath(fileName);
      setFs(prev => ({
        ...prev,
        [filePath]: { type: 'file', content }
      }));
      setOutput(prev => [...prev, `Created file ${formatFile(fileName)} with content`]);
    },

    clear: () => {
      setOutput([]);
    },

    pwd: () => {
      setOutput(prev => [...prev, currentDir]);
    },

    tree: () => {
      const printTree = (dir: string, prefix = '') => {
        const contents = Object.entries(fs)
          .filter(([path]) => {
            const parent = path.substring(0, path.lastIndexOf('/'));
            return parent === dir;
          })
          .sort(([, a], [, b]) => (a.type === 'directory' ? -1 : 1));

        let result = '';
        contents.forEach(([path, info], index) => {
          const isLast = index === contents.length - 1;
          const name = path.split('/').pop() || '';
          const newPrefix = prefix + (isLast ? '└── ' : '├── ');
          result += `\n${newPrefix}${info.type === 'directory' ? formatDirectory(name) : formatFile(name)}`;
          
          if (info.type === 'directory') {
            result += printTree(path, prefix + (isLast ? '    ' : '│   '));
          }
        });
        return result;
      };

      setOutput(prev => [...prev, '.' + printTree(currentDir)]);
    }
  };
}