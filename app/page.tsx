import { headers } from 'next/headers';
import SimpleChatWrapper from '../components/SimpleChatWrapper';

// Force dynamic rendering - prevents build-time static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function Home() {
  headers(); // mark route dynamic at build time
  return <SimpleChatWrapper />;
}
