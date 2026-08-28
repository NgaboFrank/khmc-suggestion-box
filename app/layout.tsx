import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'KHMC Suggestion Box',description:'KHMC patient feedback and suggestion box'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}