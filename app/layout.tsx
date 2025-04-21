import type { Metadata } from "next";

import "./globals.css";


export const metadata: Metadata = {
  title: 'lnn的小聊天室',
  description: '这是我的留言板，可以在这里给我留言，我会第一时间回复'
}

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
