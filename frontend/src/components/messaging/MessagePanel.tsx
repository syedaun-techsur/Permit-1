import React, { useEffect, useRef, useState } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { Skeleton } from '../ui/Skeleton';

export interface MessagePanelProps {
  applicationId: string;
  currentUserId: string;
  currentUserRole: 'applicant' | 'reviewer' | 'admin';
  isReviewer: boolean;
}

function formatDividerDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export const MessagePanel: React.FC<MessagePanelProps> = ({
  applicationId,
  currentUserId,
  currentUserRole: _role,
  isReviewer,
}) => {
  const { messages, loading, error, sendMessage, markAllRead } = useMessages(applicationId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lastSentMessageId, setLastSentMessageId] = useState<string | null>(null);

  // Mark all messages as read on mount / when messages load
  useEffect(() => {
    if (messages.length === 0) return;
    const unreadIds = messages
      .filter((m) => !m.readBy.includes(currentUserId))
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      void markAllRead(unreadIds);
    }
  }, [messages, currentUserId, markAllRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const unreadCount = messages.filter((m) => !m.readBy.includes(currentUserId)).length;

  const handleSend = async (body: string) => {
    const msg = await sendMessage(body);
    setLastSentMessageId(msg.id);
  };

  return (
    <div
      className="flex flex-col h-full"
      data-testid="message-panel"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-default bg-surface-card">
        <h2 className="text-heading-md text-text-primary font-semibold">Messages</h2>
        {unreadCount > 0 && (
          <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 leading-none">
            {unreadCount}
          </span>
        )}
        {isReviewer && (
          <p className="ml-auto text-xs text-text-secondary">
            Communicate with the applicant
          </p>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-surface-base">
        {loading && (
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className="w-48 h-16 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-feedback-error text-body-sm py-4">
            {error}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-32">
            <p className="text-text-secondary text-body-sm text-center">
              No messages yet. Send the first message.
            </p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <>
            {messages.map((message, index) => {
              const showDivider =
                index === 0 || !isSameDay(messages[index - 1].sentAt, message.sentAt);

              return (
                <React.Fragment key={message.id}>
                  {showDivider && (
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-border-default" />
                      <span className="text-xs text-text-secondary px-2">
                        {formatDividerDate(message.sentAt)}
                      </span>
                      <div className="flex-1 h-px bg-border-default" />
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwnMessage={message.senderId === currentUserId}
                  />
                </React.Fragment>
              );
            })}
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer: composer */}
      <MessageComposer
        applicationId={applicationId}
        onSend={handleSend}
        isReviewer={isReviewer}
        lastSentMessageId={lastSentMessageId}
      />
    </div>
  );
};

export default MessagePanel;
