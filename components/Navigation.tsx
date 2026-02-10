'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

type Tab = {
  name: string;
  href: string;
  icon: string;
  isHome?: boolean;
};

const tabs: Tab[] = [
  { name: 'Home', href: '/home', icon: '✨', isHome: true },
  { name: 'Stories', href: '/stories', icon: '📖' },
  { name: 'Audios', href: '/audios', icon: '🎧' },
  { name: 'Voice', href: '/voice', icon: '🎤' },
  { name: 'Profile', href: '/profile', icon: '👤' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-void border-t border-paper/10 z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.isHome && (pathname === '/' || pathname === '/home'));
          const isHome = tab.isHome;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-lime' : 'text-paper/60'
              }`}
            >
              <motion.div
                className={`text-2xl mb-1 ${isHome ? 'text-3xl' : ''}`}
                whileTap={{ scale: 0.9 }}
              >
                {tab.icon}
              </motion.div>
              <span className={`text-xs ${isHome ? 'font-semibold' : ''}`}>
                {tab.name}
              </span>
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

