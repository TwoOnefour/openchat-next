import Image from "next/image";

export default function MyFooter(){
    return (
        <>
            <div className="flex items-center justify-center text-sm text-gray-600">
                <span>Designed by TwoOnefour.</span>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
                <span>Powered by</span>
                <Image
                    src="/next.svg" // SVG 路径
                    alt="Next.js"
                    width={50}
                    height={50}
                    className="inline-block ml-2 mr-2" // 确保图标与文本对齐
                />

                <Image
                    src="/Cloudflare_Logo.svg" // SVG 路径
                    alt="Cloudflare"
                    width={50}
                    height={50}
                    className="inline-block ml-2" // 确保图标与文本对齐
                />
            </div>
        </>
    )
}