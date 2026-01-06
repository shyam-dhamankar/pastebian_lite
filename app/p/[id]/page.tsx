import { notFound } from 'next/navigation';
import { getStorage } from '@/lib/storage';

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storage = getStorage();
  
  const paste = await storage.getPaste(id);
  
  if (!paste) {
    notFound();
  }
  
  await storage.updatePaste(id, {
    currentViews: paste.currentViews + 1,
  });
  
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
          Paste Content
        </h1>
        <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words text-zinc-900 dark:text-zinc-50">
          {paste.content}
        </pre>
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {paste.maxViews && (
            <p>
              Views remaining: {paste.maxViews - paste.currentViews - 1}
            </p>
          )}
          {paste.ttlSeconds && (
            <p>
              Expires at:{' '}
              {new Date(paste.createdAt + paste.ttlSeconds * 1000).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
