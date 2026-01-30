'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface SessionCardProps {
  id: string;
  title: string;
  date: string;
  duration?: number;
  vibe?: string;
  persona?: string;
  sessionType: 'story' | 'audio' | 'voice';
  illustration?: string; // Emoji or icon
}

export default function SessionCard({
  id,
  title,
  date,
  duration,
  vibe,
  persona,
  sessionType,
  illustration,
}: SessionCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDefaultIllustration = () => {
    if (illustration) return illustration;
    switch (sessionType) {
      case 'story':
        return '📖';
      case 'audio':
        return '🎧';
      case 'voice':
        return '🎤';
      default:
        return '✨';
    }
  };

  const handleClick = () => {
    router.push(`/sessions/${sessionType}/${id}`);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-paper/5 border border-paper/20 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:border-paper/40 transition-colors"
    >
      {/* Illustration */}
      <div className="w-16 h-16 rounded-lg bg-paper/10 flex items-center justify-center text-3xl flex-shrink-0">
        {getDefaultIllustration()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-lg text-paper mb-1 truncate">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-paper/60 flex-wrap">
          <span>{formatDate(date)}</span>
          {duration && (
            <>
              <span>•</span>
              <span>{formatDuration(duration)}</span>
            </>
          )}
          {vibe && (
            <>
              <span>•</span>
              <span className="text-lime">{vibe}</span>
            </>
          )}
        </div>
        {persona && (
          <p className="text-xs text-paper/50 mt-1">with {persona}</p>
        )}
      </div>

      {/* Play Icon */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-lime/20 flex items-center justify-center">
          <span className="text-lime text-xl">▶</span>
        </div>
      </div>
    </motion.div>
  );
}

