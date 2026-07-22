import React from 'react';
import { Paperclip } from 'lucide-react';
import type { Message } from '../../types/message.types';

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isToday = today.getTime() === msgDate.getTime();

  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');

  if (isToday) {
    return `${hh}:${mm}`;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()} ${hh}:${mm}`;
}

function roleBadgeLabel(role: string): string {
  switch (role) {
    case 'reviewer': return 'Reviewer';
    case 'admin': return 'Admin';
    case 'applicant': return 'Applicant';
    default: return role;
  }
}

export interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const timestamp = formatTimestamp(message.sentAt);
  const roleLabel = roleBadgeLabel(message.senderRole);

  return (
    <div
      className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      data-testid="message-bubble"
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
          isOwnMessage
            ? 'bg-brand-primary text-white'
            : 'bg-surface-sidebar text-text-primary'
        }`}
      >
        {/* Sender name + role badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {message.senderName}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isOwnMessage
                ? 'bg-white/20 text-white'
                : 'bg-border-default text-text-secondary'
            }`}
          >
            {roleLabel}
          </span>
        </div>

        {/* Message body */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            {message.attachments.map((att) => (
              <a
                key={att.id}
                href={`/api/permits/${message.applicationId}/messages/${message.id}/attachments/${att.id}`}
                className={`flex items-center gap-1 text-xs underline ${
                  isOwnMessage ? 'text-white/90' : 'text-brand-primary'
                }`}
                target="_blank"
                rel="noopener noreferrer"
                download={att.filename}
              >
                <Paperclip className="w-3 h-3" aria-hidden="true" />
                {att.filename}
              </a>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-1 text-right ${
            isOwnMessage ? 'opacity-70' : 'opacity-60'
          }`}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
};
