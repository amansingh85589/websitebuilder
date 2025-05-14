import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  // In a real implementation, this would compile and render the preview
  const [url, setUrl] = useState("");

  async function main() {
    const installProcess = await webContainer.spawn('npm', ['install']);

    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));

    await webContainer.spawn('npm', ['run', 'dev']);

    // Wait for `server-ready` event
    webContainer.on('server-ready', (port, url) => {
      // ...
      console.log(url)
      console.log(port)
      setUrl(url);
    });
  }

  useEffect(() => {
    main()
  }, [])
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}
// import React, { useEffect, useRef, useState } from 'react';
// import { FileItem } from '../types';
// import { WebContainer } from '@webcontainer/api';

// interface PreviewFrameProps {
//   webContainer: WebContainer | null;
//   files: FileItem[];
// }

// export function PreviewFrame({ webContainer, files }: PreviewFrameProps) {
//   const iframeRef = useRef<HTMLIFrameElement>(null);
//   const [serverUrl, setServerUrl] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (!webContainer || files.length === 0) return;

//     const setupServer = async () => {
//       setIsLoading(true);

//       try {
//         // Install dependencies if package.json exists
//         const packageJson = files.find(file => file.name === 'package.json');
//         if (packageJson) {
//           // Run npm install
//           const installProcess = await webContainer.spawn('npm', ['install']);
//           await installProcess.exit;
//         }

//         // Try to find the correct command to start the server based on common patterns
//         // First check if we have a dev script in package.json
//         const startCommand = 'npm';
//         const startArgs = ['run', 'dev'];

//         // If we have an index.html at the root, use a simple HTTP server
//         const hasIndexHtml = files.some(file => file.name === 'index.html');
        
//         if (hasIndexHtml) {
//           // We can use a simple server for static content
//           await webContainer.spawn('npx', ['serve', '.']);
//           webContainer.on('server-ready', (port, url) => {
//             setServerUrl(url);
//             setIsLoading(false);
//           });
//         } else {
//           // Try to start whatever server is configured
//           try {
//             const startProcess = await webContainer.spawn(startCommand, startArgs);
            
//             // Listen for server-ready event
//             webContainer.on('server-ready', (port, url) => {
//               setServerUrl(url);
//               setIsLoading(false);
//             });

//             // If the process exits, try alternative commands
//             startProcess.on('exit', async (exitCode: number | null) => {
//               if (exitCode !== 0) {
//                 try {
//                   // Try vite as fallback
//                   await webContainer.spawn('npx', ['vite']);
//                   // No need to handle exit here - if this fails, we'll show the error state
//                 } catch (err) {
//                   console.error('Failed to start server:', err);
//                   setIsLoading(false);
//                 }
//               }
//             });
//           } catch (err) {
//             console.error('Failed to run start command:', err);
//             setIsLoading(false);
//           }
//         }
//       } catch (error) {
//         console.error('Failed to set up preview:', error);
//         setIsLoading(false);
//       }
//     };

//     setupServer();

//     return () => {
//       // Cleanup function when component unmounts
//       if (webContainer) {
//         webContainer.teardown();
//       }
//     };
//   }, [webContainer, files]);

//   useEffect(() => {
//     // Update iframe when serverUrl changes
//     if (serverUrl && iframeRef.current) {
//       iframeRef.current.src = serverUrl;
//     }
//   }, [serverUrl]);

//   return (
//     <div className="h-full flex flex-col">
//       {isLoading ? (
//         <div className="flex-1 flex items-center justify-center bg-[#0D1117] rounded">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//             <p className="mt-4 text-gray-400">Starting preview server...</p>
//           </div>
//         </div>
//       ) : serverUrl ? (
//         <iframe
//           ref={iframeRef}
//           className="flex-1 w-full h-full bg-white rounded"
//           title="Preview"
//           src={serverUrl}
//           sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation"
//         />
//       ) : (
//         <div className="flex-1 flex items-center justify-center bg-[#0D1117] rounded">
//           <div className="text-center p-6">
//             <div className="text-red-500 text-5xl mb-4">⚠️</div>
//             <h3 className="text-xl font-medium text-red-400 mb-2">Preview Unavailable</h3>
//             <p className="text-gray-400 max-w-md">
//               Unable to start the preview server. Make sure your project has the necessary configuration files.
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }