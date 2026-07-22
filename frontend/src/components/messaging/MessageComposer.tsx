import React, { useRef, useState } from 'react';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { messagesApi } from '../../api/messages.api';
import { useUiStore } from '../../store/ui.store';

export interface MessageComposerProps {
  applicationId: string;
  onSend: (body: string) => Promise<void>;
  isReviewer: boolean;
  lastSentMessageId?: string | null;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  applicationId,
  onSend,
  isReviewer,
  lastSentMessageId,
}) => {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addToast = useUiStore((s) => s.addToast);

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setValue('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      addToast('error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lastSentMessageId) {
      if (!lastSentMessageId) {
        addToast('warning', 'Send a message first before attaching a file.');
      }
      return;
    }

    setUploadProgress('Requesting upload URL…');
    try {
      const urlRes = await messagesApi.getAttachmentUploadUrl(applicationId, lastSentMessageId, {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      });

      setUploadProgress('Uploading…');

      // PUT directly to presigned URL (plain fetch — no auth header)
      await fetch(urlRes.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      setUploadProgress('Registering attachment…');

      await messagesApi.registerAttachment(applicationId, lastSentMessageId, {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        storageKey: urlRes.data.storageKey,
      });

      addToast('success', `Attached ${file.name} successfully.`);
    } catch {
      addToast('error', 'Failed to upload attachment. Please try again.');
    } finally {
      setUploadProgress(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="border-t border-border-default bg-surface-card p-3">
      {uploadProgress && (
        <div className="text-xs text-text-secondary mb-2 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          {uploadProgress}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment button — reviewers only */}
        {isReviewer && (
          <>
            <button
              type="button"
              data-testid="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="flex-shrink-0 p-2 text-text-secondary hover:text-text-primary hover:bg-surface-sidebar rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
              aria-label="Attach file"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" aria-hidden="true" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={(e) => { void handleFileChange(e); }}
              aria-hidden="true"
            />
          </>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          data-testid="message-composer-input"
          className="flex-1 resize-none rounded-md border border-border-default bg-surface-card px-3 py-2 text-body-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[40px] max-h-40 overflow-y-auto"
          rows={1}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={sending}
        />

        {/* Send button */}
        <button
          type="button"
          data-testid="message-send-button"
          onClick={() => { void handleSend(); }}
          disabled={sending || !value.trim()}
          className="flex-shrink-0 p-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};
