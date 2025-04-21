'use client'
import Image from 'next/image';
import {useState, useEffect, useRef, ChangeEvent, useMemo, forwardRef, memo, ImgHTMLAttributes, VideoHTMLAttributes} from "react";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";
import { JSEncrypt } from "JSEncrypt";
import CryptoJS from 'crypto-js';
// import ChatInput from "@/app/components/chatInput"
import MyFooter from "@/app/components/footer"
import VideoPlayer from "@/app/components/VideoPlayer";
type Message = {
    id: number
    text: string
    time: string
    userId: string
    timestamp: number
}

type ResponseJson = {
    code: number
    data: {msg: string, content: Message[]}
}

type ResponseJsonEncrypted = {
    code: number
    data: string
}



type ResponseJsonPublicKey = {
    code: number
    data: {msg: string, content: {publicKey: string}}
}

// const endpoint = "https://chat-one-api.voidval.com"

const endpoint = "http://127.0.0.1:8787"

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [connectionStatus, setConnectionStatus] = useState<boolean>(true)
    const [restoreNetwork, setRestoreNetwork] = useState<boolean>(false)
    const [focusedMessageId, setFocusedMessageId] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [currentUserId, setCurrentUserId] = useState("")
    const [errorTimes, setErrorTimes] = useState<number>(0)
    const messagesCount = useRef<number>(0)
    const firstLoad = useRef<boolean>(true)
    const updateMessageLock = useRef<boolean>(true)
    const [uploadStatus, setUploadStatus] = useState<string>("finished")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [firstLoadLock, setFirstLoadLock] = useState<boolean>(true)
    const messageBoxRef = useRef<HTMLInputElement>(null)
    const cryptoObj = new JSEncrypt()
    const cryptoPublicKey = useRef<string>("")
    const aesKey = "twoonefour_aes_token"
    const sentDirtyCount = useRef<number>(0)
    const fileRetryRef = useRef(null);
    const [sendMessageLock, setSendMessageLock] = useState<boolean>(false)
    const [previewImage, setPreviewImage] = useState(null);
    const imageUrl = useRef<string>("");
    const currentVideoRef = useRef(null)
    // const videoRef = useRef(null);
    const handleFocusMessage = (messageId : string) => {
        setFocusedMessageId(messageId)
    }
    const handleBlurMessage = () => {
        setFocusedMessageId("")
    }
    const loadLocalMessages = async () => {
        const localMessage = JSON.parse(localStorage.getItem("messages") as string)
        if (!localMessage)
            return

        setMessages(() => [...localMessage])
        messagesCount.current = localMessage.length
    }
    const getPrevMessage = async () => {
        try {
            updateMessageLock.current = true
            setFirstLoadLock(true)
            const data : Message[] | undefined = await checkUpdateMessage()
            setFirstLoadLock(false)
            updateMessageLock.current = false
            if (!data){
                setConnectionStatus(false)
                return
            }
            if (!connectionStatus)
                setConnectionStatus(true)
            if (data.length > 0) {
                console.log(data)

                setMessages((prevMessages) =>  {
                        const tmpmsg = [...prevMessages, ...data].sort((a, b) => {
                            return a.timestamp - b.timestamp
                        })
                        // 这里一定是排好序的，因为刚同步完成
                        localStorage.setItem("messages", JSON.stringify(tmpmsg))
                        messagesCount.current = tmpmsg.length
                        return tmpmsg
                    }
                )
                // if (localStorage.getItem("messages") as string)
                //     localStorage
                //         .setItem(
                //             "messages",
                //             JSON.stringify(
                //                 (JSON.parse(
                //                         localStorage
                //                             .getItem("messages") as string) as [])
                //                                 .concat(data)
                //             )
                //         )
                // else
                //     localStorage.setItem("messages", JSON.stringify(data))
            }

        }catch (e){
            console.log(e)
            setConnectionStatus(false)
        }finally {
            updateMessageLock.current = false
            setFirstLoadLock(false)
        }
    }
    const checkUpdateMessage= async () : Promise<Message[]|undefined> => {
        const sendData = SignJson({_messagesCount: messagesCount.current})
        const data = await fetch(`${endpoint}/api/updatemsg`, {body: sendData, method: "POST"})
        const resdata : ResponseJsonEncrypted = await data.json()
        if (resdata.code !== 200){
            localStorage.clear()
            messagesCount.current = 0
            setMessages(() => [])
            return
        }
        const plainData : ResponseJson["data"] = JSON.parse(CryptoJS.AES.decrypt(resdata.data, aesKey).toString(CryptoJS.enc.Utf8))
        return plainData.content
    }
    const updateMessage = async () => {
          if (updateMessageLock.current)
              return
          updateMessageLock.current = true
          const _messages = await checkUpdateMessage()
          if (!_messages || _messages.length === 0){
              updateMessageLock.current = false
              return
          }

          let afterRemoveSelfMessageOnSentDirt : Message[] = []
          if (sentDirtyCount.current){
                      const cookies = document.cookie.split(";")
                      let cookiesDict = {}
                      for (let cookie of cookies){
                          const cookieItems = cookie.split("=")
                          cookiesDict[cookieItems[0].trim()] = cookieItems[1].trim()
                      }

                      const _currentUserId = cookiesDict["userId"]
                      for (const _message of _messages){
                          if (_message.userId === _currentUserId)
                              continue
                          afterRemoveSelfMessageOnSentDirt.push(_message)
                      }
          }
          else
              afterRemoveSelfMessageOnSentDirt = _messages  // 这是要添加的实际消息

          setMessages((prevMessage) => {

              const uniqueAndSortedMessagesFunc = () => {
                  let tmpMessages : Message[] = []
                  // 将需要排序的元素 prevMessage[messagesCount.current, prevMessage.length]拿出来
                  for (let i = messagesCount.current; i < prevMessage.length; i++){
                      tmpMessages.push(prevMessage[i])
                  }
                  // 去掉message中未同步的自己的消息
                  const pullOutCount = tmpMessages.length
                  tmpMessages = tmpMessages.concat(afterRemoveSelfMessageOnSentDirt)
                  const _preMessage = [...prevMessage].splice(0, prevMessage.length - pullOutCount)
                  const finalMessage = _preMessage.concat(tmpMessages
                      .sort((a, b) => {
                        return a.timestamp - b.timestamp
                      })) // 排序
                  return finalMessage
              }
              console.log(_messages)
              const uniqueAndSortedMessages = uniqueAndSortedMessagesFunc()
              localStorage.setItem("messages", JSON.stringify(uniqueAndSortedMessages))
              return [...uniqueAndSortedMessages]
          })
          messagesCount.current += _messages.length // 不管去除夺少其实都是要加上的，因为发送的时候没加上
          sentDirtyCount.current = 0
          updateMessageLock.current = false
    }
    const getCookie = () => {
        const cookie = document.cookie;

		const cookies: { [key: string]: string } = {};
		cookie.split(';').forEach(pair => {
			const [key, value] = pair.trim().split('=');
			cookies[key] = value;
		});
        return cookies
    }

    // const SSEsubscribtion = () =>{
    //     const eventSouce : EventSource = new EventSource("https://chat-one-api.voidval.com/api/sse")
    //     if (eventSouce === null)
    //         return
    //     // eventSouce?.onmessage((event : MessageEvent) => {
    //     //     const data : Message = JSON.parse(event.data)
    //     //     setMessages((prevMessage) => [...prevMessage, data])
    //     // })
    //     //
    //     // eventSouce?.onerror((error : ErrorEvent) => {
    //     //     console.log(error)
    //     //     eventSouce.close()
    //     // })
    // }
    const handlePaste = async (event: ClipboardEvent) => {
        const clipboardData : DataTransfer | null = event.clipboardData;
        if (!clipboardData)
            return
        const items : DataTransferItemList | null = clipboardData.items
        if (!items)
            return

        for (const item of items) {
          if (!item)
                continue
          if (item.type.includes('image')) {
            setPreviewImage(URL.createObjectURL(item.getAsFile()))
            await fileUpload(item.getAsFile())
            break
          }
        }
    };
    const SignJson   = (json: object) : string => {
        const uuid = uuidv4().replaceAll("-", "")
        cryptoObj.setPublicKey(cryptoPublicKey.current)
        const encdata = cryptoObj.encrypt(JSON.stringify({...json, t: uuid}))
        // console.log(encdata)
        return JSON.stringify({
            data: encdata,
            t: uuid
        })
    }

    const VideoComponent = memo(
      ({ src, ...rest }: VideoHTMLAttributes<HTMLVideoElement>) => {

        return (
          <VideoPlayer selectVideo={currentVideoRef} src={src} {...rest}></VideoPlayer>
        );
      },
      (prev, next) => prev.src === next.src // 仅在 src 变化时重新渲染
    );

    // 提取并 memo 图片组件
    const MemoImg = memo(
      ({ src, ...rest }:ImgHTMLAttributes<HTMLImageElement>) => <img loading="lazy" src={src} {...rest} />,
      (prev, next) => prev.src === next.src
    );

    // 在父组件中缓存 components 配置
    const markdownComponents = useMemo(() => ({
      img: (props) => {
        const { src, ...rest } = props;
        const videoFormats = /\.(mp4|avi|mkv|mov|flv)$/i;
        const isVideo = videoFormats.test(src.toLowerCase());
        if (isVideo) {
          return <VideoComponent src={src} {...rest} />;
        }

        return <MemoImg src={src} {...rest} />;
      },
      a: (props) => {
            const { href, children, ...rest } = props;
            return (
              <a href={href} style={{ color: 'blue', textDecoration: 'underline' }} {...rest}>
                {children}
              </a>
            );
      }
    }), []); // 空依赖确保配置只生成一次

    useEffect(() => {
          // 加载cookie

         // if ('EventSource' in window){
         //     SSEsubscribtion()
         // }

              fetch(`${endpoint}/api/publickey`,
              {
                  method: "POST",
                  body: JSON.stringify({data: CryptoJS.AES.encrypt("qaq", aesKey).toString()}),
                  headers: {"Content-type": "application/json"}
              })
              .then(async (res) => {
                  if(!res.ok)
                      return

                          // define plain data CryptoJS.AES.decrypt(ciphertext, aesKey)
                  await (async () => {
                    const json : ResponseJsonEncrypted = await res.json()
                      const publicKey = JSON.parse(CryptoJS
                            .AES
                            .decrypt
                            (
                                json.data,
                                aesKey
                            )
                            .toString(CryptoJS.enc.Utf8)
                        ).content.publicKey
                    cryptoPublicKey.current = publicKey
                    cryptoObj.setPublicKey
                    (
                        publicKey
                    )
                  })()

          await fetch(`${endpoint}/api/user`,
              {
                  method: "POST",
                  body: SignJson(
                      {
                          "userId": getCookie().userId
                      }
                  )
              })
            .then(
              async (data) => {
                  if (!data.ok){
                      setConnectionStatus(false)
                      return
                  }
                  const data1 = await data.json()
                  setCurrentUserId(data1.data.content.userId)

                  document.cookie = `userId=${data1.data.content.userId}; Expires=Thu, 31 Dec 2099 23:59:59 GMT; Path=/;`
                  if (!connectionStatus)
                      setConnectionStatus(true)

              })
            .catch((e) => {
                console.log(e)
                setConnectionStatus(false)
            })

            // 加载本地消息
            await loadLocalMessages()
            await getPrevMessage()

          }).catch((error) => {
              console.error(error)
          })



        const interval = setInterval(() => {
            if (updateMessageLock.current)
                return

                updateMessage().then(()=>setConnectionStatus(true)).catch((error) => {
                    setConnectionStatus(false)
                    console.error(error)
                    updateMessageLock.current = false
                })

        }, 5000)


        const handleKeyDown = (event : KeyboardEvent) => {
            if (event.key === 'Enter') {
                // 触发按钮的点击事件
                document.getElementById('button')?.click();
            }
        };
        const messageBox = messageBoxRef.current
        const handleFocus = () => {
            if (!messageBox)
                return
            messageBox.addEventListener('paste', handlePaste);
        };

        const handleBlur = () => {
          if (!messageBox)
                return
          messageBox.removeEventListener('paste', handlePaste);
        };

        document.addEventListener('keydown', handleKeyDown);
        if (messageBox){
            messageBox.addEventListener('focus', handleFocus);
            messageBox.addEventListener('blur', handleBlur);
        }

        return () => {
            clearInterval(interval)

            document.removeEventListener('keydown', handleKeyDown);
            if (messageBox){
                messageBox.removeEventListener('focus', handleFocus);
                messageBox.removeEventListener('blur', handleBlur);
                messageBox.removeEventListener('paste', handlePaste);
            }


        }
    }, [])
    useEffect(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" }) // 平滑滚动
        }
    }, [messages])
    useEffect(() => {
      console.log(connectionStatus ? "Online" : "offline")
        if (!connectionStatus)
            setErrorTimes(errorTimes + 1)
      if (connectionStatus) {
        // 只有非首次连接时才显示恢复提示
        if (!firstLoad.current) {

            setRestoreNetwork(true)
        }
        else{
            firstLoad.current = false
        }
      }
    }, [connectionStatus])
    useEffect(() => {
        if (!restoreNetwork)
            return
        const timeOut = setTimeout(() => {
            setRestoreNetwork(false)
            setErrorTimes(0)
        }, 1500)
        return () => clearTimeout(timeOut)
    }, [restoreNetwork])
    const getTime = () => {
        const now = new Date()
        const year = String(now.getFullYear())
        const month = String(now.getMonth() + 1).padStart(2, "0")
        const day = String(now.getDate()).padStart(2, "0")
        const hours = String(now.getHours()).padStart(2, "0")
        const minutes = String(now.getMinutes()).padStart(2, "0")
        const seconds = String(now.getSeconds()).padStart(2, "0")
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    const getTimeStamp = () => {
        const now = new Date()
        return now.getTime()
    }
    const sendMessage = async () => {
        if (!inputValue.trim() && !previewImage)
            return
        setInputValue("")

        updateMessageLock.current = true
        setSendMessageLock(true)
        const newMessage: Message = {
          id: messagesCount.current, // 不要在这里自增，只在updatemsg里改变它的值，因为在那里同步
          text: inputValue + (imageUrl.current ? `![](${imageUrl.current})`: ""),
          timestamp: getTimeStamp(),
          time: getTime(),
          userId: getCookie().userId
        }

        const signMessage = {
            timestamp: newMessage.timestamp,
            userId: newMessage.userId
        }
        const response = await fetch(
          `${endpoint}/api/chat`,
          {
            headers: {"Content-Type": "application/json; utf-8"},
            method:"POST",
            body: JSON.stringify({sign: SignJson(signMessage), message: newMessage})
          }
        )

        sentDirtyCount.current += 1
        const encrytpedRes = await response.json()
        const data : ResponseJson['data'] = JSON.parse(CryptoJS.AES.decrypt(encrytpedRes.data, aesKey).toString(CryptoJS.enc.Utf8))
        setMessages((prevMessages) => {
            // 在这里判断消息id是否混乱了, 如果消息id不等于预期，说明消息混乱, 不要修改messagesCount 应当直接更新，下一次消息更新到本地，然后遍历数组下表[messagesCount.current, id]

            // if (data.data.content.length === 0){
            //     localStorage.setItem("messages", JSON.stringify([...prevMessages, newMessage]))
            //     return [...prevMessages, newMessage]
            // }
            // if (data.data.content[0].id !== messagesCount.current) 说明消息已经混乱，在下次接收消息时补上

            // const uniqueMessages = [
            //     ...new Map([...prevMessages, ...data.data.content].map(item => [item.id, item])).values()
            // ];
            // 直接添加即可

            return [...prevMessages, ...data.content]
        })
        updateMessageLock.current = false
        setPreviewImage(null)
        imageUrl.current = ""
        setSendMessageLock(false)
    }
    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {

        const file : File | null | undefined = event.target.files?.item(0)
        if (!file) return;
        fileRetryRef.current = file
        setPreviewImage(URL.createObjectURL(file))
        await fileUpload(file)
      };
    const fileUpload = async (file: File | null) => {
        if (!file)
            return
        try {
          // 上传文件到 /api/upload
            setUploadStatus("uploading")
            // setInputValue("正在上传，请稍等...")

            const formData = new FormData();
            const newFile = new File([file], `${uuidv4()}.${file.name.split(".").pop()}`, {
              type: file.type, // 保持文件类型一致
              lastModified: file.lastModified, // 保持最后修改时间一致
            });
            formData.append("file", newFile)
            let retryCount = 0
            while (retryCount++ <= 2) {
                    setTimeout(() => {}, 2 ** retryCount)

                    try{

                        const response = await axios.post(`${endpoint}/api/upload`, formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        })
                        console.log(`upload success: ${response.data.data.links.url}`)
                        imageUrl.current = response.data.data.links.url
                        setUploadStatus("finished")
                        return
                    }
                    catch (e){
                        console.log(`重试上传第${retryCount}次，错误原因${e}`)
                    }

            }
            if (retryCount >= 3)
                throw new Error('')

        } catch (error) {
          console.error('Upload failed:', error);
          setUploadStatus("error")
        }

    }

    return (

        <div className="flex flex-col h-screen bg-gray-100 p-10">
            <div className="flex-1 flex flex-col overflow-y-auto mb-4 shadow-md">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        // hover:bg-gray-100 border-gray-200 rounded-lg rounded bg-white  bg-green-500 shadow
                        className={`p-2 mb-2  bg-gray-100  
                          ${msg.userId === "admin" ?
                            'mr-auto text-red-700 accent-blue-500' :
                            (currentUserId === msg.userId ?
                                'ml-auto text-black ' :
                                "mr-auto text-black ")}`}
                        onMouseEnter={() => handleFocusMessage(msg.id.toString())}
                        onMouseLeave={handleBlurMessage}
                        onFocus={() => handleFocusMessage(msg.id.toString())}
                        onBlur={handleBlurMessage}
                    >


                        <div
                            className="mb-auto">
                            <Image
                                src={msg.userId === "admin" ?
                                    "/banner.svg" :
                                    "/murasame_default.svg"}
                                alt="User Avatar"
                                width={20}
                                height={40}
                                className={`rounded-full ${currentUserId === msg.userId ? "ml-auto" : "mr-auto"}`}/>
                        </div>
                        <div className={
                            `mt-2 p-2 mb-2 hover:bg-gray-100 border-gray-200 rounded-lg shadow max-w-[50vw]
                                  ${currentUserId === msg.userId ? 'text-right bg-green-500' : " bg-white text-left"}`}>
                            <ReactMarkdown
                              remarkPlugins={[remarkBreaks, remarkGfm]}
                              components={markdownComponents}
                            >
                              {msg.text}
                            </ReactMarkdown>

                            <div className="text-xs text-gray-300 mt-1">{msg.time}</div>
                            {focusedMessageId === msg.id.toString() && (
                                <div className="text-xs text-gray-300 mt-1">
                                    <div className="text-xs text-gray-300 mt-1">User ID: {msg.userId}</div>
                                    <div>Message ID: {msg.id}</div>
                                </div>

                            )}
                        </div>
                    </div>

                ))}
                <div ref={messagesEndRef}/>
            </div>
            <div className="flex flex-row mb-2">

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <div
                    className={"flex items-center border border-gray-200 rounded-md p-2 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm hover:shadow-md cursor-pointer"}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Image
                    src="file.svg"
                    alt="发送文件"
                    width={20}
                    height={40}
                    className="mr-auto"
                    title="发送文件"
                    />
                    <div className={"text-black"}>发送文件</div>
                </div>

            </div>
            {previewImage && (
              <div className="inline-block relative align-middle mb-2"> {/* 核心布局容器 */}
                {/* 图片基础容器 */}
                <div className="relative inline-block isolate"> {/* 创建新的层叠上下文 */}
                  {/* 图片主体 */}
                  <Image
                    src={previewImage}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="rounded-lg shadow-sm object-cover border border-gray-200"
                  />

                  {/* 关闭按钮（浮动层） */}
                  <div className="
                    absolute -right-2 -top-2 z-[25]
                    w-6 h-6 rounded-full bg-red-500
                    flex items-center justify-center
                    hover:bg-red-600 active:scale-95
                    transition-all duration-200
                    shadow-md cursor-pointer
                    ring-2 ring-white"
                    onClick={() => {
                        imageUrl.current = ""
                        fileRetryRef.current = null
                        setPreviewImage(null)
                    }}
                  >
                    <span className="text-white text-sm leading-none">×</span>
                  </div>

                  {uploadStatus === 'error' && (
                      <div className="
                      absolute inset-0 z-20
                      bg-black/30 rounded-lg
                      backdrop-blur-[1px]"
                      >

                          <div className="flex flex-col absolute inset-0 items-center justify-center gap-1.5">

                              <button
                                  className="px-3  text-white
                                   transition-colors text-sm
                                  flex flex-col items-center justify-center gap-1.5"
                                  onClick={() => {
                                      fileUpload(fileRetryRef.current)
                                  }}
                              >
                                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                      <path
                                          d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                                  </svg>
                              </button>
                          </div>
                      </div>
                  )}

                    {/* 加载状态（覆盖层） */}
                    {uploadStatus === "uploading" && (
                        <div className="
                      absolute inset-0 z-20
                      bg-black/30 rounded-lg
                      backdrop-blur-[1px]"
                        >
                            <div className="
                        absolute inset-0
                        flex items-center justify-center
                        text-white">
                                <div className="
                          w-8 h-8
                          border-4 border-t-transparent
                          rounded-full animate-spin
                          border-current"
                                />
                            </div>
                        </div>
                    )}
                </div>
              </div>
            )}


            <div className="flex">
            <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 p-2 border rounded-l text-black"
                    placeholder="输入一些消息（支持粘贴图片）"
                    ref={messageBoxRef}
                />
                <button
                    onClick={sendMessage}
                    id="button"
                    disabled={(!inputValue.trim() && !previewImage) || sendMessageLock || uploadStatus !== "finished"}
                    className={`bg-blue-500 text-white p-2 rounded-r ${
                        (inputValue.trim() || previewImage) && connectionStatus && !sendMessageLock && (uploadStatus !== "error" && uploadStatus !== "uploading")
                            ? "hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            : "bg-gray-300"
                    }`}

                >
                    Send
                </button>
            </div>
            {/*<ChatInput ></ChatInput>*/}
            {!connectionStatus && (
                <div className="fixed inset-0 flex items-center justify-center transition-opacity duration-500">
                    <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-lg">
                        You are offline. Please check your internet connection.
                    </div>
                </div>
            )}
            {restoreNetwork && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg">
                        You are back online!
                    </div>
                </div>
            )}
            {firstLoadLock && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="flex flex-col items-center">
                        {/* 旋转加载图标 */}
                        <div
                            className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                        {/* 提示信息 */}
                        <div className="mt-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg">
                            第一次进入需要加载消息，cloudflare服务器比较卡请耐心等待，预估30s
                        </div>
                    </div>
                </div>
            )}
            <MyFooter></MyFooter>

        </div>
    )
}
