'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Avatar, Spinner } from '@/components/ui';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useChatMessages } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/services/socket';
import type { ChatMessage } from '@/types';

export default function ChatPage() {
  const { rideId } = useParams<{ rideId: string }>();
  const searchParams = useSearchParams();
  const receiverId   = searchParams.get('receiverId') || '';
  const receiverName = searchParams.get('receiverName') || 'Chat';

  const { user } = useAuthStore();
  const { data: initialMessages, isLoading } = useChatMessages(rideId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  // Seed initial messages
  useEffect(() => {
    if (initialMessages?.data) setMessages(initialMessages.data);
  }, [initialMessages]);

  // Socket setup
  useEffect(() => {
    if (!user) return;
    socketService.connect(user.id);
    socketService.joinRideRoom(rideId);

    const unsub1 = socketService.onReceiveMessage((msg: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    const unsub2 = socketService.onTyping(({ userId, isTyping }) => {
      if (userId !== user.id) setPartnerTyping(isTyping);
    });

    return () => { unsub1(); unsub2(); };
  }, [user, rideId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const sendMessage = useCallback(() => {
    if (!user || !input.trim()) return;
    socketService.sendMessage({
      rideId,
      senderId:  user.id,
      receiverId,
      message:   input.trim(),
    });
    setInput('');
    socketService.emitTyping(rideId, user.id, false);
  }, [user, rideId, receiverId, input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!user) return;
    socketService.emitTyping(rideId, user.id, val.length > 0);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socketService.emitTyping(rideId, user.id, false), 2000);
  };

  // Group messages by sender
  const shouldShowAvatar = (msg: ChatMessage, idx: number) => {
    if (msg.senderId === user?.id) return false;
    const prev = messages[idx - 1];
    return !prev || prev.senderId !== msg.senderId;
  };

  return (
    <div className="h-screen bg-[#0A0A0A] flex flex-col">
      {/* Header */}
      <div className="bg-[#111111] border-b border-white/[0.06] pt-16 pb-4 px-4 flex items-center gap-3">
        <Link href="/bookings" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Avatar name={receiverName} size="sm" />
        <div>
          <p className="text-white font-semibold text-sm">{receiverName}</p>
          <p className="text-xs text-[#00C853]">
            {partnerTyping ? 'typing...' : 'online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center pt-20"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#00C853]/10 flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-[#00C853]" />
            </div>
            <p className="text-white/60 font-medium">Start the conversation</p>
            <p className="text-white/25 text-sm mt-1">Say hi to your fellow traveller</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === user?.id}
                showAvatar={shouldShowAvatar(msg, idx)}
              />
            ))}
            {/* Typing indicator */}
            {partnerTyping && (
              <div className="flex items-end gap-2 mb-3">
                <Avatar name={receiverName} size="sm" className="mb-1" />
                <div className="bg-[#1A1A1A] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div className="bg-[#111111] border-t border-white/[0.06] px-4 py-3 flex items-end gap-3">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none resize-none max-h-32"
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-11 h-11 bg-[#00C853] hover:bg-[#00A846] disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
        >
          <Send className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
}
