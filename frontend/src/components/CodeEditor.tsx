// import React from 'react';
// import Editor from '@monaco-editor/react';
// import { FileItem } from '../types';

// interface CodeEditorProps {
//   file: FileItem | null;
// }

// export function CodeEditor({ file }: CodeEditorProps) {
//   if (!file) {
//     return (
//       <div className="h-full flex items-center justify-center text-gray-400">
//         Select a file to view its contents
//       </div>
//     );
//   }

//   return (
//     <Editor
//       height="100%"
//       defaultLanguage="typescript"
//       theme="vs-dark"
//       value={file.content || ''}
//       options={{
//         readOnly: true,
//         minimap: { enabled: false },
//         fontSize: 14,
//         wordWrap: 'on',
//         scrollBeyondLastLine: false,
//       }}
//     />
//   );
// }


import React from 'react';
import { FileItem } from '../types';

interface CodeEditorProps {
  file: FileItem | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  const [content, setContent] = React.useState<string>('');
  
  React.useEffect(() => {
    if (file && file.type === 'file') {
      setContent(file.content || '');
    }
  }, [file]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Update file content in memory
    if (file && file.type === 'file') {
      file.content = e.target.value;
    }
  };

  if (!file || file.type !== 'file') {
    return (
      <div className="h-full flex items-center justify-center text-[#8b949e]">
        Select a file to edit
      </div>
    );
  }

  const getLanguageClass = () => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return 'language-javascript';
      case 'html':
        return 'language-html';
      case 'css':
        return 'language-css';
      case 'json':
        return 'language-json';
      case 'md':
        return 'language-markdown';
      default:
        return 'language-plaintext';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-[#161B22] text-[#c9d1d9] px-4 py-2 border-b border-[#30363d]">
        <span className="font-mono text-sm">{file.path}</span>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        className={`flex-1 w-full p-4 font-mono text-sm bg-[#0D1117] text-[#c9d1d9] focus:outline-none resize-none ${getLanguageClass()}`}
        spellCheck={false}
      />
    </div>
  );
}