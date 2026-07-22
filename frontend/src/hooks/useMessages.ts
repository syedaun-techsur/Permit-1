import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '../api/messages.api';
import type { Message } from '../types/message.types';

interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (body: string) => Promise<Message>;
  markAllRead: (messageIds: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useMessages(applicationId: string): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagesApi.list(applicationId);
      setMessages(res.data.data);
    } catch {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void fetchMessages();
    const interval = setInterval(() => {
      void fetchMessages();
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (body: string): Promise<Message> => {
      const res = await messagesApi.send(applicationId, body);
      setMessages((prev) => [...prev, res.data]);
      return res.data;
    },
    [applicationId],
  );

  const markAllRead = useCallback(
    async (messageIds: string[]) => {
      await Promise.all(messageIds.map((id) => messagesApi.markRead(applicationId, id)));
    },
    [applicationId],
  );

  return { messages, loading, error, sendMessage, markAllRead, refetch: fetchMessages };
}
