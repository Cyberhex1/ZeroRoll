export type AIProviderId = 
  | 'gemini' 
  | 'openai' 
  | 'anthropic' 
  | 'grok' 
  | 'openrouter' 
  | 'copilot' 
  | 'custom';

export interface ProviderModelOption {
  id: string;
  name: string;
  badge?: string;
  description: string;
  isDefault?: boolean;
}

export interface ProviderGuideStep {
  stepNumber: number;
  title: string;
  description: string;
  link?: {
    url: string;
    label: string;
  };
  tip?: string;
}

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  tagline: string;
  badge: string;
  iconName: string;
  accentColor: string;
  websiteUrl: string;
  keyPortalUrl: string;
  keyPlaceholder: string;
  keyPrefixHint?: string;
  defaultModel: string;
  defaultBaseUrl?: string;
  models: ProviderModelOption[];
  guide: {
    overview: string;
    steps: ProviderGuideStep[];
    pricingNote: string;
  };
}

export const AI_PROVIDERS: Record<AIProviderId, AIProviderConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Fast, high-context multimodal reasoning from Google AI Studio',
    badge: 'Recommended',
    iconName: 'Sparkles',
    accentColor: '#38bdf8',
    websiteUrl: 'https://aistudio.google.com',
    keyPortalUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIzaSy...',
    keyPrefixHint: 'AIzaSy',
    defaultModel: 'gemini-3.5-flash',
    models: [
      {
        id: 'gemini-3.5-flash',
        name: 'Gemini 3.5 Flash',
        badge: 'Fast & Creative',
        description: 'Recommended default. Ultra-fast turns, vivid narrative descriptions, and active free quota.',
        isDefault: true
      },
      {
        id: 'gemini-3.6-flash',
        name: 'Gemini 3.6 Flash',
        badge: 'Flagship',
        description: 'Latest high-fidelity narrative generation with enhanced D&D rule adjudication.'
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro',
        badge: 'Deep Reasoning',
        description: 'Pro-tier tactical intelligence, deep lore consistency, and complex boss battles.'
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        badge: 'Low Latency',
        description: 'Lightweight, rapid response model ideal for lightning-fast combat exchanges.'
      }
    ],
    guide: {
      overview: 'Get a Google AI Studio API key directly from Google. Free tier available with generous rate limits.',
      steps: [
        {
          stepNumber: 1,
          title: 'Open Google AI Studio',
          description: 'Navigate to Google AI Studio and sign in with your Google account.',
          link: { url: 'https://aistudio.google.com/app/apikey', label: 'Get Gemini API Key' }
        },
        {
          stepNumber: 2,
          title: 'Create API Key',
          description: 'Click the "Create API Key" blue button. Select "Create key in new project" or choose an existing project.'
        },
        {
          stepNumber: 3,
          title: 'Copy & Paste Key',
          description: 'Copy your generated key (starts with "AIzaSy...") and paste it into the field below.',
          tip: 'Google AI Studio keys are 100% free with no credit card required to get started.'
        }
      ],
      pricingNote: 'Free tier includes daily quota per model. Auto-cascading fallback is enabled.'
    }
  },

  openai: {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    tagline: 'Industry standard GPT-4o and o3 models from OpenAI',
    badge: 'Popular',
    iconName: 'Bot',
    accentColor: '#10b981',
    websiteUrl: 'https://platform.openai.com',
    keyPortalUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-proj-...',
    keyPrefixHint: 'sk-',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        badge: 'Fast & Affordable',
        description: 'High speed, cost-effective Game Master with outstanding dialogue and creativity.',
        isDefault: true
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        badge: 'Flagship DM',
        description: 'Omni flagship model. Supreme narrative depth, cinematic worldbuilding, and tactical checks.'
      },
      {
        id: 'o3-mini',
        name: 'o3-mini',
        badge: 'Tactical Reasoner',
        description: 'Specialized reasoning model for high-stakes mystery solving and complex encounter calculations.'
      }
    ],
    guide: {
      overview: 'Power ZeroRoll using your personal OpenAI developer key.',
      steps: [
        {
          stepNumber: 1,
          title: 'Open OpenAI Developer Platform',
          description: 'Visit the OpenAI API platform and log in or create an account.',
          link: { url: 'https://platform.openai.com/api-keys', label: 'OpenAI API Keys' }
        },
        {
          stepNumber: 2,
          title: 'Generate Secret Key',
          description: 'Click "+ Create new secret key", give it a name like "ZeroRoll TTRPG", and click "Create secret key".'
        },
        {
          stepNumber: 3,
          title: 'Copy & Paste',
          description: 'Copy the key (begins with "sk-...") and paste it into the field below.',
          tip: 'Ensure your OpenAI account has at least $5 in prepaid credits on platform.openai.com/settings/organization/billing.'
        }
      ],
      pricingNote: 'GPT-4o-mini is extremely affordable (fractions of a cent per 1,000 words).'
    }
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    tagline: 'Literary prose and nuanced character dialogue from Claude',
    badge: 'Prose GM',
    iconName: 'Feather',
    accentColor: '#f97316',
    websiteUrl: 'https://console.anthropic.com',
    keyPortalUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-...',
    keyPrefixHint: 'sk-ant-',
    defaultModel: 'claude-3-5-haiku-20241022',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    models: [
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        badge: 'Lightning Prose',
        description: 'Fast, evocative storytelling with literary prose and quick combat narration.',
        isDefault: true
      },
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet',
        badge: 'Next-Gen Master',
        description: 'Hybrid reasoning GM capable of deep emergent narrative twists and lore continuity.'
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        badge: 'Master Storyteller',
        description: 'Gold standard for creative fiction, authentic character roleplay, and dramatic immersion.'
      }
    ],
    guide: {
      overview: 'Use Claude for deeply atmospheric, literary prose and nuanced NPC interactions.',
      steps: [
        {
          stepNumber: 1,
          title: 'Visit Anthropic Console',
          description: 'Go to the Anthropic Developer Console and sign in.',
          link: { url: 'https://console.anthropic.com/settings/keys', label: 'Anthropic API Keys' }
        },
        {
          stepNumber: 2,
          title: 'Create Key',
          description: 'Under "API Keys", click "Create Key", label it "ZeroRoll", and generate.'
        },
        {
          stepNumber: 3,
          title: 'Paste Key',
          description: 'Copy your key (starts with "sk-ant-api...") and paste it below.',
          tip: 'Requires active credits on console.anthropic.com/settings/plans.'
        }
      ],
      pricingNote: 'Claude 3.5 Haiku offers exceptional value for roleplay storytelling.'
    }
  },

  grok: {
    id: 'grok',
    name: 'xAI Grok',
    tagline: 'Bold, witty, and unfiltered narrative twists from xAI',
    badge: 'Dynamic',
    iconName: 'Zap',
    accentColor: '#e2e8f0',
    websiteUrl: 'https://x.ai',
    keyPortalUrl: 'https://console.x.ai',
    keyPlaceholder: 'xai-...',
    keyPrefixHint: 'xai-',
    defaultModel: 'grok-2-mini',
    defaultBaseUrl: 'https://api.x.ai/v1',
    models: [
      {
        id: 'grok-2-mini',
        name: 'Grok 2 Mini',
        badge: 'Fast & Punchy',
        description: 'High-speed storytelling with vivid pacing and dark humor.',
        isDefault: true
      },
      {
        id: 'grok-2',
        name: 'Grok 2',
        badge: 'Full Power',
        description: 'Deep knowledge, witty narrative prose, and high-intensity combat descriptions.'
      },
      {
        id: 'grok-beta',
        name: 'Grok Beta',
        badge: 'Experimental',
        description: 'Early preview access to latest xAI narrative improvements.'
      }
    ],
    guide: {
      overview: 'Connect directly to xAI to run your campaigns with Grok models.',
      steps: [
        {
          stepNumber: 1,
          title: 'Open xAI Console',
          description: 'Go to the xAI Developer Console and sign in with your X account.',
          link: { url: 'https://console.x.ai', label: 'xAI Console' }
        },
        {
          stepNumber: 2,
          title: 'Generate API Key',
          description: 'Navigate to "API Keys", click "Create API Key", and copy the token.'
        },
        {
          stepNumber: 3,
          title: 'Paste Key',
          description: 'Paste your xAI token into the input below.',
          tip: 'xAI offers initial free credits upon account activation.'
        }
      ],
      pricingNote: 'Pay-as-you-go via xAI developer credits.'
    }
  },

  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    tagline: 'One API key for 200+ models: DeepSeek, Llama 3, Mistral, Qwen, Claude, GPT-4',
    badge: 'Universal Hub',
    iconName: 'Globe',
    accentColor: '#a855f7',
    websiteUrl: 'https://openrouter.ai',
    keyPortalUrl: 'https://openrouter.ai/keys',
    keyPlaceholder: 'sk-or-v1-...',
    keyPrefixHint: 'sk-or-',
    defaultModel: 'deepseek/deepseek-chat',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    models: [
      {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek V3 (Chat)',
        badge: 'Ultra Cheap & Smart',
        description: 'State-of-the-art open weights model with stellar roleplaying ability and pennies per million tokens.',
        isDefault: true
      },
      {
        id: 'deepseek/deepseek-r1',
        name: 'DeepSeek R1 (Reasoning)',
        badge: 'Super Reasoner',
        description: 'Deep chain-of-thought Game Master for complex puzzles and strategic encounter resolution.'
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct',
        badge: 'Open Weight Flagship',
        description: 'High-energy storytelling, deep fantasy knowledge, and excellent dialogue generation.'
      },
      {
        id: 'mistralai/mistral-large-2411',
        name: 'Mistral Large 2',
        badge: 'European Flagship',
        description: 'Sophisticated worldbuilder with multilingual mastery and rich poetic description.'
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet (via OpenRouter)',
        badge: 'Premium Prose',
        description: 'Access Claude without an Anthropic account.'
      }
    ],
    guide: {
      overview: 'OpenRouter is the easiest way to access DeepSeek, Llama, Claude, and 200+ models with a single unified balance.',
      steps: [
        {
          stepNumber: 1,
          title: 'Sign up on OpenRouter',
          description: 'Visit OpenRouter.ai and sign in with Google or GitHub.',
          link: { url: 'https://openrouter.ai/keys', label: 'OpenRouter Keys' }
        },
        {
          stepNumber: 2,
          title: 'Create Key',
          description: 'Click "Create Key", label it "ZeroRoll", and set an optional credit limit.'
        },
        {
          stepNumber: 3,
          title: 'Paste & Select Any Model',
          description: 'Paste your key (starts with "sk-or-v1-...") below. You can use any model on OpenRouter!',
          tip: 'OpenRouter supports free models (with :free tag) and ultra-cheap DeepSeek models.'
        }
      ],
      pricingNote: 'Supports crypto, credit cards, and multiple free model tiers.'
    }
  },

  copilot: {
    id: 'copilot',
    name: 'GitHub Models / Copilot',
    tagline: 'Access free developer model endpoints via GitHub Personal Access Tokens',
    badge: 'GitHub Developers',
    iconName: 'Github',
    accentColor: '#60a5fa',
    websiteUrl: 'https://github.com/marketplace/models',
    keyPortalUrl: 'https://github.com/settings/tokens',
    keyPlaceholder: 'ghp_... or github_pat_...',
    keyPrefixHint: 'ghp_',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://models.inference.ai.azure.com',
    models: [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini (GitHub Models)',
        badge: 'Free Tier Available',
        description: 'Powered through GitHub Marketplace Models with free developer quotas.',
        isDefault: true
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o (GitHub Models)',
        badge: 'Flagship',
        description: 'Full GPT-4o model hosted through Azure AI / GitHub Models.'
      },
      {
        id: 'Phi-3.5-mini-instruct',
        name: 'Microsoft Phi-3.5 Mini',
        badge: 'Fast',
        description: 'Lightweight, rapid reasoning model from Microsoft Research.'
      }
    ],
    guide: {
      overview: 'Use your GitHub Personal Access Token (PAT) to call GitHub Models directly for free during preview.',
      steps: [
        {
          stepNumber: 1,
          title: 'Open GitHub Personal Access Tokens',
          description: 'Go to GitHub Token Settings and create a new Classic or Fine-Grained token.',
          link: { url: 'https://github.com/settings/tokens', label: 'GitHub PAT Settings' }
        },
        {
          stepNumber: 2,
          title: 'Generate Token',
          description: 'No special scopes are required for GitHub Models inference. Click "Generate token".'
        },
        {
          stepNumber: 3,
          title: 'Paste Token',
          description: 'Copy your token (starts with "ghp_" or "github_pat_") and paste it below.',
          tip: 'Free preview rate limits apply per GitHub user account.'
        }
      ],
      pricingNote: 'Free during GitHub Models preview tier.'
    }
  },

  custom: {
    id: 'custom',
    name: 'Custom / Local LLM',
    tagline: 'Connect Ollama, LM Studio, vLLM, DeepSeek, Groq, or any OpenAI-compatible API',
    badge: 'Self-Hosted / Local',
    iconName: 'Server',
    accentColor: '#eab308',
    websiteUrl: 'https://ollama.com',
    keyPortalUrl: '',
    keyPlaceholder: 'Optional for local (e.g. ollama) or custom API key...',
    defaultModel: 'llama3.3',
    defaultBaseUrl: 'http://localhost:11434/v1',
    models: [
      {
        id: 'llama3.3',
        name: 'Llama 3.3 (Local)',
        badge: 'Ollama Default',
        description: 'Default local model running via Ollama.',
        isDefault: true
      },
      {
        id: 'deepseek-r1:14b',
        name: 'DeepSeek R1 14B (Local)',
        badge: 'Local Reasoning',
        description: 'Local reasoning model on Ollama / LM Studio.'
      },
      {
        id: 'mistral',
        name: 'Mistral (Local)',
        badge: 'Local Classic',
        description: 'Popular lightweight model for local offline play.'
      }
    ],
    guide: {
      overview: 'Run completely offline on your own machine using Ollama or LM Studio, or connect any OpenAI-compatible custom server.',
      steps: [
        {
          stepNumber: 1,
          title: 'Launch your Local LLM',
          description: 'Start Ollama (`ollama run llama3.3`) or launch LM Studio with Local Server enabled.',
          link: { url: 'https://ollama.com', label: 'Download Ollama' }
        },
        {
          stepNumber: 2,
          title: 'Configure Base URL',
          description: 'For Ollama use `http://localhost:11434/v1`. For LM Studio use `http://localhost:1234/v1`. For Groq use `https://api.groq.com/openai/v1`.'
        },
        {
          stepNumber: 3,
          title: 'Set Model Name',
          description: 'Type the exact name of the model installed in your local runner.',
          tip: 'Make sure your local server has CORS enabled if running in browser (e.g. OLLAMA_ORIGINS="*" ollama serve).'
        }
      ],
      pricingNote: '100% Free & completely private on your local hardware.'
    }
  }
};

export const DEFAULT_AI_PROVIDER: AIProviderId = 'gemini';
