// import React, { useState } from 'react';
// import { FolderTree, File, ChevronRight, ChevronDown } from 'lucide-react';
// import { FileItem } from '../types';

// interface FileExplorerProps {
//   files: FileItem[];
//   onFileSelect: (file: FileItem) => void;
// }

// interface FileNodeProps {
//   item: FileItem;
//   depth: number;
//   onFileClick: (file: FileItem) => void;
// }

// function FileNode({ item, depth, onFileClick }: FileNodeProps) {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleClick = () => {
//     if (item.type === 'folder') {
//       setIsExpanded(!isExpanded);
//     } else {
//       onFileClick(item);
//     }
//   };

//   return (
//     <div className="select-none">
//       <div
//         className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer"
//         style={{ paddingLeft: `${depth * 1.5}rem` }}
//         onClick={handleClick}
//       >
//         {item.type === 'folder' && (
//           <span className="text-gray-400">
//             {isExpanded ? (
//               <ChevronDown className="w-4 h-4" />
//             ) : (
//               <ChevronRight className="w-4 h-4" />
//             )}
//           </span>
//         )}
//         {item.type === 'folder' ? (
//           <FolderTree className="w-4 h-4 text-blue-400" />
//         ) : (
//           <File className="w-4 h-4 text-gray-400" />
//         )}
//         <span className="text-gray-200">{item.name}</span>
//       </div>
//       {item.type === 'folder' && isExpanded && item.children && (
//         <div>
//           {item.children.map((child, index) => (
//             <FileNode
//               key={`${child.path}-${index}`}
//               item={child}
//               depth={depth + 1}
//               onFileClick={onFileClick}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
//   return (
//     <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto">
//       <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-100">
//         <FolderTree className="w-5 h-5" />
//         File Explorer
//       </h2>
//       <div className="space-y-1">
//         {files.map((file, index) => (
//           <FileNode
//             key={`${file.path}-${index}`}
//             item={file}
//             depth={0}
//             onFileClick={onFileSelect}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

import React from 'react';
import { FileItem } from '../types';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items
      .sort((a, b) => {
        // Sort folders first, then files
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      })
      .map((item) => (
        <FileTreeItem
          key={item.path}
          item={item}
          depth={depth}
          onFileSelect={onFileSelect}
        />
      ));
  };

  return (
    <div className="text-[#c9d1d9]">
      {files.length > 0 ? (
        <div className="file-tree">
          {renderFileTree(files)}
        </div>
      ) : (
        <div className="text-center py-8 text-[#8b949e]">
          No files created yet
        </div>
      )}
    </div>
  );
}

interface FileTreeItemProps {
  item: FileItem;
  depth: number;
  onFileSelect: (file: FileItem) => void;
}

function FileTreeItem({ item, depth, onFileSelect }: FileTreeItemProps) {
  const [expanded, setExpanded] = React.useState(depth < 1);

  const toggleExpand = () => {
    if (item.type === 'folder') {
      setExpanded(!expanded);
    }
  };

  const handleClick = () => {
    if (item.type === 'file') {
      onFileSelect(item);
    } else {
      toggleExpand();
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-[#30363d] ${
          depth > 0 ? 'mt-1' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {item.type === 'folder' ? (
          <>
            <span className="mr-1 text-[#8b949e]">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <Folder size={16} className="mr-2 text-[#79c0ff]" />
          </>
        ) : (
          <>
            <span className="mr-1 w-4"></span>
            <File size={16} className="mr-2 text-[#8b949e]" />
          </>
        )}
        <span className="truncate">{item.name}</span>
      </div>

      {item.type === 'folder' && expanded && item.children && item.children.length > 0 && (
        <div className="folder-children">
          {item.children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}