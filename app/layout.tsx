import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("host") ?? "localhost";
  const protocol = host.includes("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "Wordling Rescue — Sight Word Adventures",
    description: "A playful, adaptive Dolch sight-word adventure for growing readers.",
    manifest: "/manifest.webmanifest",
    icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
    applicationName: "Wordling Rescue",
    appleWebApp: { capable: true, statusBarStyle: "default", title: "Wordling Rescue" },
    openGraph: { title:"Wordling Rescue", description:"Words are magic. Build sight-word confidence through playful, adaptive practice.", images:[{url:image,width:1536,height:1024,alt:"Wordling Rescue — Words are magic."}] },
    twitter: { card:"summary_large_image", title:"Wordling Rescue", description:"A playful, adaptive sight-word adventure.", images:[image] },
  };
}
export const viewport: Viewport = { width:"device-width", initialScale:1, themeColor:"#fff8eb" };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

