import { RiverTwins } from '@/components/river-twins';
export default async function RiverTwinsPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const params = await searchParams;
  return <RiverTwins standalone presentation={params.collection === 'showcase'} />;
}
