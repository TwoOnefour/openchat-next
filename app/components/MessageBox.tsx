// import Image from "next/image";
// import ReactMarkdown from "react-markdown";
// import remarkBreaks from "remark-breaks";
// import remarkGfm from "remark-gfm";
// import {useState} from "react";
//
// export default function MessageBox(
//     messages
// ){
//     const [currentUserId, setCurrentUserId] = useState("")
//     const handleFocusMessage = (messageId : string) => {
//         setFocusedMessageId(messageId)
//     }
//     const handleBlurMessage = () => {
//         setFocusedMessageId("")
//     }
//     return (
//         <div className="flex-1 flex flex-col overflow-y-auto mb-4 shadow-md">
//                 {messages.map((msg) => (
//                     <div
//                         key={msg.id}
//                         className={`p-2 mb-2  bg-gray-100
//                           ${msg.userId === "admin" ?
//                             'mr-auto text-red-700 accent-blue-500' :
//                             (currentUserId === msg.userId ?
//                                 'ml-auto text-black ' :
//                                 "mr-auto text-black ")}`}
//                         onMouseEnter={() => handleFocusMessage(msg.id.toString())}
//                         onMouseLeave={handleBlurMessage}
//                         onFocus={() => handleFocusMessage(msg.id.toString())}
//                         onBlur={handleBlurMessage}
//                     >
//                         <div
//                             className="mb-auto">
//                             <Image
//                                 src={msg.userId === "admin" ?
//                                     "/banner.svg" :
//                                     "/murasame_default.svg"}
//                                 alt="User Avatar"
//                                 width={20}
//                                 height={40}
//                                 className={`rounded-full ${currentUserId === msg.userId ? "ml-auto" : "mr-auto"}`}/>
//                         </div>
//                         <div className={
//                             `mt-2 p-2 mb-2 hover:bg-gray-100 border-gray-200 rounded-lg shadow max-w-[50vw]
//                                   ${currentUserId === msg.userId ? 'text-right bg-green-500' : " bg-white text-left"}`}>
//                             <ReactMarkdown
//                               remarkPlugins={[remarkBreaks, remarkGfm]}
//                               components={markdownComponents}
//                             >
//                               {msg.text}
//                             </ReactMarkdown>
//
//                             <div className="text-xs text-gray-300 mt-1">{msg.time}</div>
//                             {focusedMessageId === msg.id.toString() && (
//                                 <div className="text-xs text-gray-300 mt-1">
//                                     <div className="text-xs text-gray-300 mt-1">User ID: {msg.userId}</div>
//                                     <div>Message ID: {msg.id}</div>
//                                 </div>
//
//                             )}
//                         </div>
//                     </div>
//
//                 ))}
//                 <div ref={messagesEndRef}/>
//             </div>
//
//     )
// }