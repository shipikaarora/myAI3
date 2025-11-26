// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyAI3",
  description: "MyAI3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <div className="chat-container">
          {/* Left - quick actions (hidden on small screens) */}
          <aside className="chat-panel hidden md:flex flex-col">
            <div className="text-sm font-semibold pb-2">Quick Actions</div>
            <nav className="flex flex-col gap-2">
              <a className="py-2 px-3 rounded-md hover:bg-[var(--beige)]" href="#">New chat</a>
              <a className="py-2 px-3 rounded-md hover:bg-[var(--beige)]" href="#">Templates</a>
              <a className="py-2 px-3 rounded-md hover:bg-[var(--beige)]" href="#">Saved prompts</a>
            </nav>
          </aside>

          {/* Center - main chat area */}
          <main className="chat-panel">
            {children}
          </main>

          {/* Right - tips and context (hidden on small screens) */}
          <aside className="chat-panel hidden lg:block">
            <div className="text-sm font-semibold pb-2">MSME Tips</div>
            <div className="text-xs text-muted-foreground space-y-3">
              <div>• Start with product + city + goal (e.g., "price bulk candles, Jaipur").</div>
              <div>• Mention monthly budget to get realistic plans.</div>
              <div>• Ask for templates: pricelists, WhatsApp messages, product descriptions.</div>
            </div>
          </aside>
        </div>
      </body>
    </html>
  );
}
