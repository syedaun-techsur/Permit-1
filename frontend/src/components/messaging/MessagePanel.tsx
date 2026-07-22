import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { messagesApi } from '../../api/messages.api';
import type { Message } from '../../types/message.types';
import { useUiStore } from '../../store/ui.store';

export interface MessagePanelProps {
  applicationId: string;
  currentUserId: string;
  currentUserRole: 'applicant' | 'reviewer' | 'admin';
  isReviewer: boolean;
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 text-xs text-text-secondary ${isOwn ? 'flex-row-reverse' : ''}`}>
        <span className="font-medium text-text-primary">{message.senderName}</span>
        <span>{message.senderRole}</span>
      </div>
      <div
        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
          isOwn
            ? 'bg-brand-primary text-white rounded-br-none'
            : 'bg-surface-sidebar text-text-primary rounded-bl-none'
        }`}
      >
        {message.body}
      </div>
    </div>
  );
}

export const MessagePanel: React.FC<MessagePanelProps> = ({
  applicationId,
  currentUserId,
  currentUserRole: _role,
  isReviewer,
}) => {
  const { addToast } = useUiStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagesApi.list(applicationId);
      setMessages(res.data.data);
    } catch {
      // fail silently on polling errors
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setIsSending(true);
    try {
      const res = await messagesApi.send(applicationId, trimmed);
      setMessages((prev) => [...prev, res.data]);
      setBody('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to send message.';
      addToast('error', msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-white rounded-xl border border-border-default overflow-hidden"
      data-testid="message-panel"
    >
      <div className="px-4 py-3 border-b border-border-default bg-surface-sidebar">
        <h3 className="text-sm font-semibold text-text-primary">Messages</h3>
        {isReviewer && (
          <p className="text-xs text-text-secondary mt-0.5">
            Communicate with the applicant about this application.
          </p>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-secondary text-center">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-border-default p-3">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message…"
            maxLength={5000}
            className="flex-1 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary"
            data-testid="message-input"
          />
          <button
            type="submit"
            disabled={isSending || !body.trim()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brand-primary text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
            aria-label="Send message"
            data-testid="message-send-btn"
          >
            {isSending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
