import SuggestionBox from '../components/SuggestionBox';

// Keep the public suggestion page fast and cacheable on Vercel.
export const dynamic = 'force-static';
export const runtime = 'edge';

export default function Home() {
  return <SuggestionBox />;
}
