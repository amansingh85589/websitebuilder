// import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { StepsList } from '../components/StepsList';
// import { FileExplorer } from '../components/FileExplorer';
// import { TabView } from '../components/TabView';
// import { CodeEditor } from '../components/CodeEditor';
// import { PreviewFrame } from '../components/PreviewFrame';
// import { Step, FileItem, StepType } from '../types';
// import axios from 'axios';
// import { BACKEND_URL } from '../config';
// import { parseXml } from '../steps';
// import { useWebContainer } from '../hooks/useWebContainer';
// import { FileNode } from '@webcontainer/api';
// import { Loader } from '../components/Loader';

// const MOCK_FILE_CONTENT = `// This is a sample file content
// import React from 'react';

// function Component() {
//   return <div>Hello World</div>;
// }

// export default Component;`;

// export function Builder() {
//   const location = useLocation();
//   const { prompt } = location.state as { prompt: string };
//   const [userPrompt, setPrompt] = useState("");
//   const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [templateSet, setTemplateSet] = useState(false);
//   const webcontainer = useWebContainer();

//   const [currentStep, setCurrentStep] = useState(1);
//   const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
//   const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
//   const [steps, setSteps] = useState<Step[]>([]);

//   const [files, setFiles] = useState<FileItem[]>([]);

//   useEffect(() => {
//     let originalFiles = [...files];
//     let updateHappened = false;
//     steps.filter(({status}) => status === "pending").map(step => {
//       updateHappened = true;
//       if (step?.type === StepType.CreateFile) {
//         let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
//         let currentFileStructure = [...originalFiles]; // {}
//         const finalAnswerRef = currentFileStructure;
  
//         let currentFolder = ""
//         while(parsedPath.length) {
//           currentFolder =  `${currentFolder}/${parsedPath[0]}`;
//           const currentFolderName = parsedPath[0];
//           parsedPath = parsedPath.slice(1);
  
//           if (!parsedPath.length) {
//             // final file
//             const file = currentFileStructure.find(x => x.path === currentFolder)
//             if (!file) {
//               currentFileStructure.push({
//                 name: currentFolderName,
//                 type: 'file',
//                 path: currentFolder,
//                 content: step.code
//               })
//             } else {
//               file.content = step.code;
//             }
//           } else {
//             /// in a folder
//             const folder = currentFileStructure.find(x => x.path === currentFolder)
//             if (!folder) {
//               // create the folder
//               currentFileStructure.push({
//                 name: currentFolderName,
//                 type: 'folder',
//                 path: currentFolder,
//                 children: []
//               })
//             }
  
//             currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
//           }
//         }
//         originalFiles = finalAnswerRef;
//       }

//     })

//     if (updateHappened) {

//       setFiles(originalFiles)
//       setSteps(steps => steps.map((s: Step) => {
//         return {
//           ...s,
//           status: "completed"
//         }
        
//       }))
//     }
//     console.log(files);
//   }, [steps, files]);

//   useEffect(() => {
//     const createMountStructure = (files: FileItem[]): Record<string, any> => {
//       const mountStructure: Record<string, any> = {};
  
//       const processFile = (file: FileItem, isRootFolder: boolean) => {  
//         if (file.type === 'folder') {
//           // For folders, create a directory entry
//           mountStructure[file.name] = {
//             directory: file.children ? 
//               Object.fromEntries(
//                 file.children.map(child => [child.name, processFile(child, false)])
//               ) 
//               : {}
//           };
//         } else if (file.type === 'file') {
//           if (isRootFolder) {
//             mountStructure[file.name] = {
//               file: {
//                 contents: file.content || ''
//               }
//             };
//           } else {
//             // For files, create a file entry with contents
//             return {
//               file: {
//                 contents: file.content || ''
//               }
//             };
//           }
//         }
  
//         return mountStructure[file.name];
//       };
  
//       // Process each top-level file/folder
//       files.forEach(file => processFile(file, true));
  
//       return mountStructure;
//     };
  
//     const mountStructure = createMountStructure(files);
  
//     // Mount the structure if WebContainer is available
//     console.log(mountStructure);
//     webcontainer?.mount(mountStructure);
//   }, [files, webcontainer]);

//   async function init() {
//     const response = await axios.post(`${BACKEND_URL}/template`, {
//       prompt: prompt.trim()
//     });
//     setTemplateSet(true);
    
//     const {prompts, uiPrompts} = response.data;

//     setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
//       ...x,
//       status: "pending"
//     })));

//     setLoading(true);
//     const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
//       messages: [...prompts, prompt].map(content => ({
//         role: "user",
//         content
//       }))
//     })

//     setLoading(false);

//     setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
//       ...x,
//       status: "pending" as "pending"
//     }))]);

//     setLlmMessages([...prompts, prompt].map(content => ({
//       role: "user",
//       content
//     })));

//     setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
//   }

//   useEffect(() => {
//     init();
//   }, [])

// //   return (
// //     <div className="min-h-screen bg-gray-900 flex flex-col">
// //       <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
// //         <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
// //         <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
// //       </header>
      
// //       <div className="flex-1 overflow-hidden">
// //         <div className="h-full grid grid-cols-4 gap-6 p-6">
// //           <div className="col-span-1 space-y-6 overflow-auto">
// //             <div>
// //               <div className="max-h-[75vh] overflow-scroll">
// //                 <StepsList
// //                   steps={steps}
// //                   currentStep={currentStep}
// //                   onStepClick={setCurrentStep}
// //                 />
// //               </div>
// //               <div>
// //                 <div className='flex'>
// //                   <br />
// //                   {(loading || !templateSet) && <Loader />}
// //                   {!(loading || !templateSet) && <div className='flex'>
// //                     <textarea value={userPrompt} onChange={(e) => {
// //                     setPrompt(e.target.value)
// //                   }} className='p-2 w-full'></textarea>
// //                   <button onClick={async () => {
// //                     const newMessage = {
// //                       role: "user" as "user",
// //                       content: userPrompt
// //                     };

// //                     setLoading(true);
// //                     const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
// //                       messages: [...llmMessages, newMessage]
// //                     });
// //                     setLoading(false);

// //                     setLlmMessages(x => [...x, newMessage]);
// //                     setLlmMessages(x => [...x, {
// //                       role: "assistant",
// //                       content: stepsResponse.data.response
// //                     }]);
                    
// //                     setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
// //                       ...x,
// //                       status: "pending" as "pending"
// //                     }))]);

// //                   }} className='bg-purple-400 px-4'>Send</button>
// //                   </div>}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //           <div className="col-span-1">
// //               <FileExplorer 
// //                 files={files} 
// //                 onFileSelect={setSelectedFile}
// //               />
// //             </div>
// //           <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
// //             <TabView activeTab={activeTab} onTabChange={setActiveTab} />
// //             <div className="h-[calc(100%-4rem)]">
// //               {activeTab === 'code' ? (
// //                 <CodeEditor file={selectedFile} />
// //               ) : (
// //                 <PreviewFrame webContainer={webcontainer} files={files} />
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// return (
//   <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] flex flex-col">
//     {/* Header */}
//     <header className="bg-[#161B22] border-b border-[#30363D] px-6 py-4 shadow-md">
//       <h1 className="text-xl font-semibold text-white">Website Builder</h1>
//       <p className="text-sm text-[#8B949E] mt-1">Prompt: {prompt}</p>
//     </header>

//     {/* Main Content */}
//     <div className="flex-1 overflow-hidden">
//       <div className="h-full grid grid-cols-4 gap-6 p-6">
//         {/* Steps List */}
//         <div className="col-span-1 space-y-6 overflow-auto bg-[#161B22] rounded-lg shadow-lg p-4">
//           <h2 className="text-lg font-semibold mb-4 text-white">Build Steps</h2>
//           <div className="max-h-[75vh] overflow-scroll steps-list">
//             <StepsList
//               steps={steps}
//               currentStep={currentStep}
//               onStepClick={setCurrentStep}
//             />
//           </div>
//           <div>
//             {(loading || !templateSet) && (
//               <Loader />
//             )}
//             {!loading && templateSet && (
//               <div className="flex items-center gap-4 mt-4">
//                 <textarea
//                   value={userPrompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                   placeholder="Type your next prompt..."
//                   className="flex-grow p-2 bg-[#161B22] border border-[#30363D] rounded-md text-white placeholder-[#8B949E] focus:ring focus:ring-blue-500"
//                 ></textarea>
//                 <button
//                   onClick={async () => {
//                     const newMessage = {
//                       role: "user" as "user",
//                       content: userPrompt,
//                     };

//                     setLoading(true);
//                     const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
//                       messages: [...llmMessages, newMessage],
//                     });
//                     setLoading(false);

//                     setLlmMessages((x) => [...x, newMessage]);
//                     setLlmMessages((x) => [
//                       ...x,
//                       {
//                         role: "assistant",
//                         content: stepsResponse.data.response,
//                       },
//                     ]);

//                     setSteps((s) => [
//                       ...s,
//                       ...parseXml(stepsResponse.data.response).map((x) => ({
//                         ...x,
//                         status: "pending" as "pending",
//                       })),
//                     ]);
//                   }}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
//                 >
//                   Send
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* File Explorer */}
//         <div className="col-span-1 bg-[#161B22] rounded-lg shadow-lg p-4 overflow-auto file-explorer">
//           <FileExplorer files={files} onFileSelect={setSelectedFile} />
//         </div>

//         {/* Code Editor / Preview */}
//         <div className="col-span-2 bg-[#161B22] rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
//           <TabView activeTab={activeTab} onTabChange={setActiveTab} />
//           <div className="h-[calc(100%-4rem)]">
//             {activeTab === "code" ? (
//               <CodeEditor file={selectedFile} />
//             ) : (
//               <PreviewFrame webContainer={webcontainer} files={files} />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );
// }


import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';

export function Builder() {
  const location = useLocation();
  // Handle the case when location.state is undefined
  const promptFromState = location.state?.prompt || "";
  const [userPrompt, setUserPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process pending steps and update file structure
    let originalFiles = [...files];
    let updateHappened = false;
    
    steps.filter(({status}) => status === "pending").forEach(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile && step.path) {
        let parsedPath = step.path.split("/").filter(part => part.trim() !== ""); // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles];
        const finalAnswerRef = currentFileStructure;
  
        let currentFolder = "";
        while(parsedPath.length) {
          const currentFolderName = parsedPath[0];
          currentFolder = currentFolder ? `${currentFolder}/${currentFolderName}` : currentFolderName;
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            // Final file
            const file = currentFileStructure.find(x => x.path === currentFolder);
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code || ""
              });
            } else {
              file.content = step.code || "";
            }
          } else {
            // In a folder
            const folder = currentFileStructure.find(x => x.path === currentFolder);
            if (!folder) {
              // Create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              });
            }
  
            const foundFolder = currentFileStructure.find(x => x.path === currentFolder);
            if (foundFolder && foundFolder.children) {
              currentFileStructure = foundFolder.children;
            }
          }
        }
        originalFiles = finalAnswerRef;
      }
    });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps(steps => steps.map((s: Step) => ({
        ...s,
        status: "completed"
      })));
    }
  }, [steps]);

  useEffect(() => {
    // Mount files to WebContainer when available
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    if (webcontainer && files.length > 0) {
      const mountStructure = createMountStructure(files);
      console.log("Mounting file structure:", mountStructure);
      webcontainer.mount(mountStructure).catch(err => {
        console.error("Error mounting files:", err);
      });
    }
  }, [files, webcontainer]);

  async function init() {
    if (!promptFromState) {
      setLoading(false);
      return;
    }
    
    try {
      console.log("Sending template request with prompt:", promptFromState);
      setLoading(true);
      
      // Get project template based on prompt
      const templateResponse = await axios.post(`${BACKEND_URL}/template`, {
        prompt: promptFromState
      });
      
      setTemplateSet(true);
      console.log("Template response:", templateResponse.data);
      
      const { prompts, uiPrompt } = templateResponse.data;
      
      // Parse initial template steps
      if (uiPrompt && uiPrompt[0]) {
        const initialSteps = parseXml(uiPrompt[0]).map((x: Step) => ({
          ...x,
          status: "pending"
        }));
        setSteps(initialSteps);
      }
      
      // Generate project files based on prompt
      const messages = prompts ? 
        [...prompts.map((content: string) => ({ role: "user" as const, content })), { role: "user" as const, content: promptFromState }] : 
        [{ role: "user" as const, content: promptFromState }];
      
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: messages
      });
      
      console.log("Chat API response:", stepsResponse.data);
      
      // Parse steps from response
      const newSteps = parseXml(stepsResponse.data.response).map(x => ({
        ...x,
        status: "pending" as "pending"
      }));
      
      setSteps(prevSteps => [...prevSteps, ...newSteps]);
      setLlmMessages(messages);
      setLlmMessages(prev => [...prev, {role: "assistant", content: stepsResponse.data.response}]);
      
    } catch (err) {
      console.error("Initialization error:", err);
      setError("Failed to initialize project. Please check the server connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, [promptFromState]);

  const handleSendPrompt = async () => {
    if (!userPrompt.trim()) return;
    
    try {
      const newMessage = {
        role: "user" as const,
        content: userPrompt
      };

      setLoading(true);
      
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newMessage]
      });
      
      setLlmMessages(prev => [...prev, newMessage]);
      setLlmMessages(prev => [...prev, {
        role: "assistant",
        content: stepsResponse.data.response
      }]);
      
      const newSteps = parseXml(stepsResponse.data.response).map(x => ({
        ...x,
        status: "pending" as const
      }));
      
      setSteps(prev => [...prev, ...newSteps]);
      setUserPrompt("");
      
    } catch (err) {
      console.error("Error sending prompt:", err);
      setError("Failed to process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] flex flex-col">
      {/* Header */}
      <header className="bg-[#161B22] border-b border-[#30363D] px-6 py-4 shadow-md">
        <h1 className="text-xl font-semibold text-white">Website Builder</h1>
        <p className="text-sm text-[#8B949E] mt-1">Prompt: {promptFromState}</p>
      </header>

      {/* Error display */}
      {error && (
        <div className="bg-red-800 text-white p-3 text-center">
          {error} <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          {/* Steps List */}
          <div className="col-span-1 space-y-6 overflow-auto bg-[#161B22] rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Build Steps</h2>
            <div className="max-h-[60vh] overflow-auto steps-list">
              {steps.length > 0 ? (
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              ) : loading ? (
                <div className="text-center py-4">
                  <Loader />
                </div>
              ) : (
                <div className="text-center py-4 text-[#8B949E]">
                  {!promptFromState ? 
                    "No prompt provided. Please enter a prompt below to generate website." :
                    "No steps generated yet. Try entering a prompt below."}
                </div>
              )}
            </div>
            
            {/* Prompt input */}
            <div className="mt-4">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Type your next prompt..."
                className="w-full p-3 bg-[#0D1117] border border-[#30363D] rounded-md text-white placeholder-[#8B949E] focus:ring focus:ring-blue-500 min-h-[100px]"
                disabled={loading}
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSendPrompt}
                  disabled={loading || !userPrompt.trim()}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    loading || !userPrompt.trim() 
                      ? 'bg-[#30363D] text-[#8B949E] cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? <Loader /> : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/* File Explorer */}
          <div className="col-span-1 bg-[#161B22] rounded-lg shadow-lg p-4 overflow-auto file-explorer">
            <h2 className="text-lg font-semibold mb-4 text-white">File Explorer</h2>
            {files.length > 0 ? (
              <FileExplorer files={files} onFileSelect={setSelectedFile} />
            ) : (
              <div className="text-center py-4 text-[#8B949E]">
                No files generated yet
              </div>
            )}
          </div>

          {/* Code Editor / Preview */}
          <div className="col-span-2 bg-[#161B22] rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)] bg-[#0D1117] rounded-md mt-4">
              {activeTab === "code" ? (
                selectedFile ? (
                  <CodeEditor file={selectedFile} />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#8B949E]">
                    Select a file to edit
                  </div>
                )
              ) : (
                <PreviewFrame webContainer={webcontainer} files={files} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}