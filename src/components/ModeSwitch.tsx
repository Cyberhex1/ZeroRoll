import React from 'react';
import { Link, useLocation } from 'react-router';
import { BookOpen, Dice5 } from 'lucide-react';
import { STORY_MODE_ENABLED } from '../lib/platform';

/** The two ways to play, side by side at the top of each mode's home screen. */
export default function ModeSwitch() {
  const { pathname } = useLocation();
  if (!STORY_MODE_ENABLED) return null;
  const story = pathname.startsWith('/story');
  const tab = (active: boolean) =>
    `flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
      active ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'
    }`;
  return (
    <nav aria-label="Game mode" className="flex w-full sm:w-auto gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
      <Link to="/" aria-current={!story ? 'page' : undefined} className={tab(!story)}>
        <Dice5 className="w-4 h-4" /> D&amp;D campaigns
      </Link>
      <Link to="/story" aria-current={story ? 'page' : undefined} className={tab(story)}>
        <BookOpen className="w-4 h-4" /> Story mode
      </Link>
    </nav>
  );
}
