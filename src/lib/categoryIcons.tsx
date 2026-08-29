import React from 'react';
import { 
  Wand2, 
  Compass, 
  ShieldAlert, 
  Ghost, 
  Sparkles, 
  Heart, 
  Flame, 
  Radio, 
  Skull, 
  Eye, 
  Palette, 
  Clapperboard, 
  Landmark, 
  Zap, 
  Briefcase,
  Bot
} from 'lucide-react';
import { CATEGORIES_DATA } from './categoriesData';

export function getCategoryIcon(categoryOrIconName?: string, className: string = 'w-4 h-4') {
  if (!categoryOrIconName) return <Bot className={className} />;

  // Check if direct icon name
  const name = categoryOrIconName.toLowerCase();

  // Find by category id
  const cat = CATEGORIES_DATA.find(c => c.id.toLowerCase() === name);
  const iconKey = cat ? cat.iconName : categoryOrIconName;

  switch (iconKey) {
    case 'Wand2':
    case 'fantasy':
      return <Wand2 className={className} />;
    case 'Compass':
    case 'adventure':
      return <Compass className={className} />;
    case 'ShieldAlert':
    case 'historical_adventure':
      return <ShieldAlert className={className} />;
    case 'Ghost':
    case 'horror':
      return <Ghost className={className} />;
    case 'Sparkles':
    case 'cozy_ghibli':
      return <Sparkles className={className} />;
    case 'Heart':
    case 'romantic':
      return <Heart className={className} />;
    case 'Flame':
    case 'revenge':
      return <Flame className={className} />;
    case 'Radio':
    case 'apocalypse':
      return <Radio className={className} />;
    case 'Skull':
    case 'zombie':
      return <Skull className={className} />;
    case 'Eye':
    case 'cosmic_horror':
      return <Eye className={className} />;
    case 'Palette':
    case 'psychedelic_trip':
      return <Palette className={className} />;
    case 'Clapperboard':
    case 'tiktok_drama':
      return <Clapperboard className={className} />;
    case 'Landmark':
    case 'ancient_greek':
      return <Landmark className={className} />;
    case 'Zap':
    case 'mythology':
      return <Zap className={className} />;
    case 'Briefcase':
    case 'real_life':
      return <Briefcase className={className} />;
    default:
      return <Bot className={className} />;
  }
}
