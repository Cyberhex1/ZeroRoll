import { Portrait } from './ui/Portrait';
import { campaignTitle } from '../lib/titles';
import ModeSwitch from './ModeSwitch';
import { clickable } from './ui/a11y';
import React, { useState, lazy, Suspense } from 'react';
import {
  Wand2,
  Swords,
  Compass,
  ShieldAlert,
  Ghost,
  Sparkles,
  Heart,
  Flame,
  Eye,
  Palette,
  Briefcase,
  Plus,
  Play,
  Trash2,
  Search,
  Radio,
  Clock,
  Layers,
  Skull,
  Clapperboard,
  Landmark,
  Zap,
  Dice5
} from 'lucide-react';
import { CATEGORIES_DATA, getContent } from '../content';
import { CategoryInfo, Experience } from '../types';
import { SetupDialog, CreateExperience } from '../setup/ui/SetupDialog';

// Loaded on demand so the backup code stays out of the main bundle.
const BackupPanel = lazy(() => import('./BackupPanel'));

interface CategoriesGridProps {
  experiences: Experience[];
  onSelectExperience: (experience: Experience) => void;
  onCreateExperience: CreateExperience;
  onDeleteExperience: (id: string) => void;
  selectedModel: string;
  /** Opens the AI settings from the setup menu (key, Test Connection). */
  onOpenAISettings?: () => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  experiences,
  onSelectExperience,
  onCreateExperience,
  onDeleteExperience,
  selectedModel,
  onOpenAISettings
}) => {
  const [activeTab, setActiveTab] = useState<'experiences' | 'categories'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  // The launch setup menu (src/setup). A fresh menu, and a fresh story roll, each time it opens.
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [setupOpenCount, setSetupOpenCount] = useState(0);
  const handleOpenCategoryModal = (cat: CategoryInfo) => {
    setSetupOpenCount((n) => n + 1);
    setSelectedCategory(cat);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-6 h-6" />;
      case 'Wand2': return <Wand2 className="w-6 h-6" />;
      case 'Compass': return <Compass className="w-6 h-6" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6" />;
      case 'Ghost': return <Ghost className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Heart': return <Heart className="w-6 h-6" />;
      case 'Flame': return <Flame className="w-6 h-6" />;
      case 'Radio': return <Radio className="w-6 h-6" />;
      case 'Skull': return <Skull className="w-6 h-6" />;
      case 'Eye': return <Eye className="w-6 h-6" />;
      case 'Palette': return <Palette className="w-6 h-6" />;
      case 'Clapperboard': return <Clapperboard className="w-6 h-6" />;
      case 'Landmark': return <Landmark className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      default: return <Wand2 className="w-6 h-6" />;
    }
  };

  const filteredCategories = CATEGORIES_DATA.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0F0F12] text-slate-200 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ModeSwitch />

        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-lg bg-[#16161D] border border-white/10 p-5 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-[10px] uppercase tracking-widest font-mono font-bold">
              <Dice5 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ZEROROLL • D&D 5E ADJUDICATOR
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif tracking-tight text-amber-50">
              Select An Experience
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Launch immersive tabletop campaigns with authentic D&D odds, starting scenario hooks, and story-driven dynamic state management.
            </p>
          </div>
        </div>

        {/* Navigation Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 bg-[#111118] p-1 rounded border border-white/10">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'bg-amber-600 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Genre Categories ({CATEGORIES_DATA.length})
            </button>
            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-2 relative ${
                activeTab === 'experiences'
                  ? 'bg-amber-600 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Active Experiences ({experiences.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter genres or titles..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-600/50"
            />
          </div>
        </div>

        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">
              Available Campaign Archetypes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {filteredCategories.map((cat) => {
                return (
                  <div
                    key={cat.id}
                    className="group relative rounded-lg bg-[#111118] border border-white/5 hover:border-amber-600/50 transition-all duration-200 p-4 flex flex-col justify-between hover:bg-white/5 cursor-pointer space-y-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...clickable(() => handleOpenCategoryModal(cat))}
                  >
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div 
                          className="p-2 rounded bg-white/5 border border-white/10 transition group-hover:scale-105"
                          style={{ color: cat.accentColor }}
                        >
                          {getCategoryIcon(cat.iconName)}
                        </div>
                        <span className="text-[9px] font-mono tracking-widest font-bold uppercase px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5">
                          {getContent(cat.id).openers.length} openers
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 font-serif">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] font-mono text-amber-500/90 tracking-wide mt-0.5">
                          {cat.tagline}
                        </p>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {cat.description}
                      </p>


                    </div>

                    <div className="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-500 uppercase tracking-wider text-[10px]">
                      <span>Launch Setup</span>
                      <Plus className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Experiences Tab Content */}
        {activeTab === 'experiences' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                Active Cloud Sessions
              </h2>
              <Suspense fallback={null}>
                <BackupPanel compact />
              </Suspense>
            </div>
            {experiences.length === 0 ? (
              <div className="text-center py-12 bg-[#111118] rounded-lg border border-white/5 space-y-3">
                <div className="w-10 h-10 mx-auto rounded bg-white/5 flex items-center justify-center text-amber-500 border border-white/10">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-serif font-bold text-slate-200">No Active Experiences Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Select any genre category above to launch a new tabletop adventure session.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded transition inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Browse Categories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {experiences.map((exp) => {
                  const catObj = CATEGORIES_DATA.find(c => c.id === exp.category);
                  return (
                    <div
                      key={exp.id}
                      className="group bg-[#111118] rounded-lg border border-white/5 hover:border-amber-600/50 p-4 transition duration-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-white/5 text-amber-400 border border-white/10">
                            {catObj?.name || exp.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(exp.updatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-serif font-bold text-slate-100 group-hover:text-amber-300 transition">
                            {campaignTitle(exp.title)}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {exp.description || 'Active campaign session.'}
                          </p>
                        </div>

                        {/* Character Snippet */}
                        <div className="p-2.5 rounded bg-[#0A0A0F] border border-white/5 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Portrait value={exp.character?.avatarUrl} name={exp.character?.name || 'Hero'} className="w-7 h-7 rounded border border-amber-600/40 text-xs" />
                            <div>
                              <div className="font-semibold text-slate-200 text-xs">{exp.character?.name || 'Hero'}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {exp.character?.raceOrigin || 'Adventurer'} • {exp.character?.roleClass || 'Hero'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-[10px] text-amber-400">
                            HP {exp.character?.hp ?? 10}/{exp.character?.maxHp ?? 10}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => onSelectExperience(exp)}
                          className="flex-1 py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3 h-3 fill-black" />
                          Resume
                        </button>

                        <button
                          onClick={() => { if (window.confirm(`Delete "${exp.title}" for good? This removes it from this device and the cloud.`)) onDeleteExperience(exp.id); }}
                          className="p-1.5 rounded bg-white/5 hover:bg-red-950 hover:text-red-300 text-slate-500 transition border border-white/5"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedCategory && (
          <SetupDialog
            key={`${selectedCategory.id}:${setupOpenCount}`}
            category={selectedCategory}
            icon={getCategoryIcon(selectedCategory.iconName)}
            selectedModel={selectedModel}
            onCreate={onCreateExperience}
            onClose={() => setSelectedCategory(null)}
            onOpenAISettings={onOpenAISettings}
          />
        )}

      </div>
    </div>
  );
};

