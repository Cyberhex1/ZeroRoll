import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { isMatureContentEnabled, setMatureContentEnabled } from '../lib/contentRating';

/** Settings: the Mature content switch, on the website as well as the PC app. */
export function ContentRatingPanel() {
  const [mature, setMature] = useState(isMatureContentEnabled());
  return (
    <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-1.5">
      <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        Content rating
      </h3>
      <label className="flex items-start gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={mature}
          onChange={(e) => {
            setMature(e.target.checked);
            setMatureContentEnabled(e.target.checked);
          }}
        />
        <span>
          Mature content
          <span className="block text-[11px] text-slate-500">Shows stories rated mature. In the PC app it also offers an uncensored local model.</span>
        </span>
      </label>
    </div>
  );
}
