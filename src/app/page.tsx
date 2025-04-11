import { ApiKeyInput } from './components/ApiKeyInput';
import { ChatInterface } from './components/ChatInterface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Desire Exploration AI</h1>
        <div className="mb-8">
          <ApiKeyInput />
        </div>
        <div className="h-[600px] border rounded-lg overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
