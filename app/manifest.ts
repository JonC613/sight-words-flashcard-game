import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return {
  name:"Wordling Rescue", short_name:"Wordlings",
  description:"Playful, adaptive Dolch sight-word practice.",
  start_url:"/", display:"standalone", background_color:"#fff8eb", theme_color:"#fff8eb", orientation:"any",
  icons:[{src:"/favicon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}],
};}

