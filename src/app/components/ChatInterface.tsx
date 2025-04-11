"use client";

import { useState, useRef, useEffect } from 'react';
import { VoiceInput } from './VoiceInput';
import { ImageInput } from './ImageInput';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useChatStore } from '../store/chatStore';

export const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      alert('Please set your API key first');
      return;
    }

    const userMessage = { role: 'user' as const, content: input };
    addMessage(userMessage);
    setInput('');
    setStreamingMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          apiKey,
          messages: messages.map(({ role, content }) => ({ role, content }))
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let assistantMessage = '';
      addMessage({ role: 'assistant' as const, content: '' });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        assistantMessage += text;
        setStreamingMessage(assistantMessage);
      }

      const newMessages = [...messages, userMessage, { role: 'assistant' as const, content: assistantMessage }];
      useChatStore.setState({ messages: newMessages });
      setStreamingMessage('');
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant' as const,
        content: 'Sorry, there was an error processing your request.',
      });
    }
  };

  const handleTranscript = (text: string) => {
    setInput(text);
  };

  const handleImageUpload = async (file: File) => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      alert('Please set your API key first');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('apiKey', apiKey);

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const { text } = await response.json();
      setInput(text);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <MarkdownRenderer content={message.content} />
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg p-3 bg-gray-200 text-gray-800">
              <MarkdownRenderer content={streamingMessage} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md"
            placeholder="Type your message..."
          />
          <VoiceInput onTranscript={handleTranscript} />
          <ImageInput onImageUpload={handleImageUpload} />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}; 