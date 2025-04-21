import React, {useRef, useEffect, useState, createElement} from 'react';

export default function VideoPlayer({ selectVideo, src, ...rest}) {
  const videoRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const playTimeoutRef = useRef(null);
  const srcInit = useRef<boolean>(false)
  const handleVideoClickOnEnter = () => {
    if (videoRef.current) {
      selectVideo.current = videoRef.current
      videoRef.current.controls = true;
      setShowControls(true);
    }
  };
  useEffect(() => {
    const videoElement = videoRef.current;

    // 确保 videoElement 存在
    if (!videoElement) {
      console.error('Video element not found!');
      return;
    }
    // if (updateMessageLock.current) return
    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (playTimeoutRef.current) {
              clearTimeout(playTimeoutRef.current);
            }
            playTimeoutRef.current = setTimeout(() => {
              // 视频进入视口，开始播放
              if (!srcInit.current){
                const source = document.createElement("source")
                source.type = 'video/mp4'
                source.src = videoElement.getAttribute("data-src")
                videoElement.appendChild(source)
                srcInit.current = true
              }
              videoElement.play().catch((error) => {
                console.error('Autoplay failed:', error);
              });
            })

          } else {
            // 视频离开视口，暂停播放
            if (playTimeoutRef.current){
              clearTimeout(playTimeoutRef.current)
              playTimeoutRef.current = null
            }
            videoElement.pause();
          }
        });
      },
      {
        threshold: 0.5, // 当 50% 的视频进入视口时触发
      }
    );

    // 开始观察 videoElement
    observer.observe(videoElement);
    const handleFullscreenChange = () => {

        if (!document.fullscreenElement && videoRef.current) {
          videoRef.current.muted = true; // 退出全屏恢复静音
          console.log("退出全屏")
        }
        else if (videoRef.current && selectVideo.current === videoRef.current){
          videoRef.current.muted = false
        }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // 组件卸载时断开 Observer
    return () => {
      observer.disconnect();
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      if (!playTimeoutRef.current) return

      clearTimeout(playTimeoutRef.current)
      playTimeoutRef.current = null
    };
  }, []);

        return (
          <span
            style={{ position: 'relative', maxWidth: '100%', cursor: 'pointer' }}
            onMouseEnter={handleVideoClickOnEnter}
          >
            <video
              controls={showControls}
              autoPlay
              loop
              preload="none"
              data-src={src}
              playsInline
              muted
              style={{ maxWidth: '100%' }}
              ref={videoRef}
              {...rest}
            >

              Your browser does not support the video tag.
            </video>
          </span>
        );
}

