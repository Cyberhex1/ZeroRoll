import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ZeroRoll Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearStorageAndReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F0F12] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#16161D] border border-amber-600/40 rounded-xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold font-serif text-amber-50">Adventure Encountered a Critical Roll</h1>
              <p className="text-xs text-slate-400">
                A client-side runtime error occurred while rendering the tabletop interface.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded bg-black/50 border border-white/10 text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2 px-4 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleClearStorageAndReset}
                className="w-full sm:flex-1 py-2 px-4 rounded bg-white/5 hover:bg-red-950/50 hover:text-red-300 text-slate-400 border border-white/10 text-xs font-semibold transition flex items-center justify-center gap-2"
                title="Clears corrupted local cache and restarts fresh"
              >
                <Trash2 className="w-4 h-4" />
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
