import {ImgHTMLAttributes, memo, useEffect, useMemo, useRef, useState, VideoHTMLAttributes} from "react";

export default function MarkDownComponent(){
    const videoRef = useRef<HTMLVideoElement>(null);
    const VideoComponent = memo(
      ({ src, ...rest }: VideoHTMLAttributes<HTMLVideoElement>) => {

        const [showControls, setShowControls] = useState(false);
        // const [showMask, setShowMask] = useState(true);

        const handleVideoClickOnEnter = () => {
          if (videoRef.current) {
            videoRef.current.controls = true;
            setShowControls(true);
          }
        };

        return (
          <span
            style={{ position: 'relative', maxWidth: '100%', cursor: 'pointer' }}
            onMouseEnter={handleVideoClickOnEnter}
          >
            <video
              controls={showControls}
              autoPlay
              loop
              playsInline
              muted
              style={{ maxWidth: '100%' }}
              ref={videoRef}
              {...rest}
            >
              <source src={src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </span>
        );
      },
      (prev, next) => prev.src === next.src // 仅在 src 变化时重新渲染
    );

    // 提取并 memo 图片组件
    const MemoImg = memo(
      ({ src, ...rest }:ImgHTMLAttributes<HTMLImageElement>) => <img src={src} {...rest} />,
      (prev, next) => prev.src === next.src
    );

    useEffect(() => {
      const videoElement = videoRef.current;

      if (!videoElement) return;

      // 创建 Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // 视频进入视口，开始播放
              videoElement.play();
            } else {
              // 视频离开视口，暂停播放
              videoElement.pause();
            }
          });
        },
        {
          threshold: 0.5, // 当 50% 的视频进入视口时触发
        }
      );
      observer.observe(videoElement);
      const handleFullscreenChange = () => {
          if (!document.fullscreenElement && videoRef.current) {
            videoRef.current.muted = true; // 退出全屏恢复静音
          }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () =>{
            if (videoElement){
                observer.unobserve(videoElement)
            }

            document.removeEventListener("fullscreenchange", handleFullscreenChange)
      }
    }, []);

    // 在父组件中缓存 components 配置
     // 空依赖确保配置只生成一次
    return useMemo(() => ({
        img: (props) => {
            const {src, ...rest} = props;
            const videoFormats = /\.(mp4|avi|mkv|mov|flv)$/i;
            const isVideo = videoFormats.test(src.toLowerCase());
            if (isVideo) {
                return <VideoComponent src={src} {...rest} />;
            }

            return <MemoImg src={src} {...rest} />;
        }
    }), [])
}