export interface FileSystem {
  [key: string]: {
    type: 'file' | 'directory';
    content?: string;
  };
}

export interface CommandHandler {
  (args: string[]): void;
}

export interface Commands {
  [key: string]: CommandHandler;
}