import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { freePortraitsAllowed, setFreePortraitsAllowed } from '../lib/portraits';

/** S18: the free portrait engine is a third party, so it is the player's choice. */
export const PortraitSettingsPanel: React.FC = () => {
  const [on, setOn] = useState(freePortraitsAllowed);
  return (
    <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
        <Image className="w-3.5 h-3.5 text-amber-400" />
        Hero portraits
      </h3>
      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => {
            setFreePortraitsAllowed(e.target.checked);
            setOn(e.target.checked);
          }}
          className="mt-0.5 accent-amber-500"
        />
        <span>
          Allow free portraits from pollinations.ai. The portrait description (appearance, class and genre, never your
          hero's name or story) is sent to that service. With an OpenAI key, DALL-E is tried first. Portraits are kept on this device.
        </span>
      </label>
    </div>
  );
};
