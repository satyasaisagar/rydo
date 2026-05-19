import { type ChatMessage } from '@/types';
import { Avatar } from '@/components/ui';
import { formatRelative } from '@/utils';
import { cn } from '@/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  return (
    <div className={cn('flex items-end gap-2 mb-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {showAvatar && !isOwn ? (
        <Avatar name={message.sender?.name || '?'} src={message.sender?.profileImage} size="sm" className="mb-1 flex-shrink-0" />
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Bubble */}
      <div className={cn('max-w-[72%] flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {showAvatar && !isOwn && (
          <p className="text-xs text-white/30 mb-1 ml-1">{message.sender?.name}</p>
        )}

        <div className={cn(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isOwn
            ? 'bg-[#00C853] text-black rounded-br-md'
            : 'bg-[#1A1A1A] text-white border border-white/[0.06] rounded-bl-md'
        )}>
          {message.messageType === 'text' && <p>{message.message}</p>}
          {message.messageType === 'image' && message.mediaUrl && (
            <img src={message.mediaUrl} alt="Shared image" className="rounded-xl max-w-full max-h-56 object-cover" />
          )}
        </div>

        <div className={cn('flex items-center gap-1.5 mt-1 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-white/20">{formatRelative(message.createdAt)}</span>
          {isOwn && (
            <span className="text-[10px] text-white/30">
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
