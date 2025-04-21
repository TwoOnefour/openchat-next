// import {useState, useRef, ChangeEvent} from 'react';
// import Image from 'next/image';
// import CryptoJS from "crypto-js";
// import {v4 as uuidv4} from "uuid";
// import axios from "axios";
//
// export default function ChatInput(endpoint:string, ) {
//     // const [inputValue, setInputValue] = useState('');
//     // const [previewImage, setPreviewImage] = useState(null);
//     // const [isUploading, setIsUploading] = useState(false); // 上传状态
//     // const fileInputRef = useRef(null);
//     // const textareaRef = useRef(null);
//     //
//     //
//     // const handleInputChange = (e) => {
//     //     setInputValue(e.target.value);
//     //     adjustTextareaHeight();
//     // };
//     //
//     // const adjustTextareaHeight = () => {
//     //     if (textareaRef.current) {
//     //         textareaRef.current.style.height = 'auto';
//     //         textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     //     }
//     // };
//     // const sendMessage = async () => {
//     //     if (!inputValue.trim())
//     //         return
//     //     setInputValue("")
//     //
//     //
//     //     updateMessageLock.current = true
//     //     setSendMessageLock(true)
//     //     const newMessage: Message = {
//     //       id: messagesCount.current, // 不要在这里自增，只在updatemsg里改变它的值，因为在那里同步
//     //       text: inputValue,
//     //       timestamp: getTimeStamp(),
//     //       time: getTime(),
//     //       userId: getCookie().userId
//     //     }
//     //
//     //     const signMessage = {
//     //         timestamp: newMessage.timestamp,
//     //         userId: newMessage.userId
//     //     }
//     //     const response = await fetch(
//     //       `${endpoint}/api/chat`,
//     //       {
//     //         headers: {"Content-Type": "application/json; utf-8"},
//     //         method:"POST",
//     //         body: JSON.stringify({sign: SignJson(signMessage), message: newMessage})
//     //       }
//     //     )
//     //
//     //     sentDirtyCount.current += 1
//     //     const encrytpedRes = await response.json()
//     //     const data : ResponseJson['data'] = JSON.parse(CryptoJS.AES.decrypt(encrytpedRes.data, aesKey).toString(CryptoJS.enc.Utf8))
//     //     setMessages((prevMessages) => {
//     //         // 在这里判断消息id是否混乱了, 如果消息id不等于预期，说明消息混乱, 不要修改messagesCount 应当直接更新，下一次消息更新到本地，然后遍历数组下表[messagesCount.current, id]
//     //
//     //         // if (data.data.content.length === 0){
//     //         //     localStorage.setItem("messages", JSON.stringify([...prevMessages, newMessage]))
//     //         //     return [...prevMessages, newMessage]
//     //         // }
//     //         // if (data.data.content[0].id !== messagesCount.current) 说明消息已经混乱，在下次接收消息时补上
//     //
//     //         // const uniqueMessages = [
//     //         //     ...new Map([...prevMessages, ...data.data.content].map(item => [item.id, item])).values()
//     //         // ];
//     //         // 直接添加即可
//     //
//     //         return [...prevMessages, ...data.content]
//     //     })
//     //     updateMessageLock.current = false
//     //     setSendMessageLock(false)
//     //     setPreviewImage(null)
//     // }
//     // const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
//     //
//     //     const file : File | null | undefined = event.target.files?.item(0)
//     //     if (!file) return;
//     //     setPreviewImage(URL.createObjectURL(file))
//     //     await fileUpload(file)
//     //   };
//     // const fileUpload = async (file: File | null) => {
//     //     if (!file)
//     //         return
//     //     try {
//     //       // 上传文件到 /api/upload
//     //         setIsUploading(true)
//     //         setInputValue("正在上传，请稍等...")
//     //
//     //         const formData = new FormData();
//     //         const newFile = new File([file], `${uuidv4()}.${file.name.split(".").pop()}`, {
//     //           type: file.type, // 保持文件类型一致
//     //           lastModified: file.lastModified, // 保持最后修改时间一致
//     //         });
//     //         formData.append("file", newFile)
//     //         const response = await axios.post(`${endpoint}/api/upload`, formData, {
//     //             headers: {
//     //               'Content-Type': 'multipart/form-data'
//     //             }
//     //         })
//     //         console.log(`upload success: ${response.data.data.links.url}`)
//     //         setPreviewImage(response.data.data.links.url)
//     //         // setInputValue(`![](${response.data.data.links.url})`)
//     //
//     //         // setPreviewImage(null);
//     //     } catch (error) {
//     //       console.error('Upload failed:', error);
//     //       setInputValue(`上传失败, 原因为${error}`)
//     //     }
//     //     finally {
//     //         setIsUploading(false)
//     //     }
//     // }
//     //
//     //
//     // return (
//     //     <div className="flex flex-col">
//     //         {/* 图片预览 */}
//     //         {previewImage && (
//     //             <div className="mb-2 relative">
//     //                 <div
//     //                     className="w-[20px] h-[40px] rounded-md bg-gray-200 flex items-center justify-center"
//     //                     style={{
//     //                         opacity: isUploading ? 0.5 : 1, // 上传时降低透明度
//     //                     }}
//     //                 >
//     //                     <Image
//     //                         src={previewImage}
//     //                         alt="Preview"
//     //                         className="rounded-md"
//     //                         width={200}
//     //                         height={200}
//     //                     />
//     //                     {/* 加载动画 */}
//     //                     {isUploading && (
//     //                         <div className="absolute inset-0 flex items-center justify-center">
//     //                             <div className="w-6 h-6 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
//     //                         </div>
//     //                     )}
//     //                 </div>
//     //             </div>
//     //         )}
//     //
//     //         {/* 分隔线 */}
//     //         {previewImage && <hr className="my-2 border-gray-300" />}
//     //
//     //         {/* 文件上传按钮 */}
//     //         <div className="flex flex-row mb-2">
//     //             <input
//     //                 type="file"
//     //                 ref={fileInputRef}
//     //                 onChange={handleFileUpload}
//     //                 className="hidden"
//     //             />
//     //             <div
//     //                 className="flex items-center border border-gray-200 rounded-md p-2 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm hover:shadow-md cursor-pointer"
//     //                 onClick={() => fileInputRef.current?.click()}
//     //             >
//     //                 <Image
//     //                     src="file.svg"
//     //                     alt="发送文件"
//     //                     width={20}
//     //                     height={40}
//     //                     className="mr-auto"
//     //                     title="发送文件"
//     //                 />
//     //                 <div className="text-black">发送文件</div>
//     //             </div>
//     //         </div>
//     //
//     //         {/* 输入框和发送按钮 */}
//     //         <div className="flex">
//     //             <textarea
//     //                 ref={textareaRef}
//     //                 value={inputValue}
//     //                 onChange={handleInputChange}
//     //                 className="flex-1 p-2 border rounded-l text-black resize-none overflow-hidden"
//     //                 placeholder="输入一些消息（支持粘贴图片）"
//     //                 rows={1}
//     //             />
//     //             <button
//     //                 onClick={sendMessage}
//     //                 id="button"
//     //                 disabled={!inputValue.trim() || isUploading} // 上传时禁用按钮
//     //                 className={`bg-blue-500 text-white p-2 rounded-r ${
//     //                     inputValue.trim() && !isUploading
//     //                         ? 'hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
//     //                         : 'bg-gray-300'
//     //                 }`}
//     //                 style={{
//     //                     cursor: inputValue.trim() && !isUploading ? 'pointer' : 'not-allowed',
//     //                 }}
//     //             >
//     //                 Send
//     //             </button>
//     //         </div>
//     //     </div>
//     );
// }
