import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, LogOut } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Portal ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearAndLogout = () => {
    try {
      localStorage.removeItem('cf_auth_token');
      localStorage.removeItem('cf_user_role');
      localStorage.removeItem('cf_current_student_id');
    } catch {}
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060b1d] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0a1538] border border-[#1b2b60] rounded-2xl p-7 shadow-2xl text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-white">
                {this.props.fallbackTitle || 'Portal Encountered an Issue'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                A component error was safely caught. Your data remains secure.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-black/40 border border-slate-800 rounded-xl text-left">
                <p className="text-[11px] font-mono text-rose-300 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] hover:from-[#e55f00] hover:to-[#ea7d29] text-white font-bold text-xs shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Reset Session &amp; Login</span>
              </button>

              <a
                href="/portal"
                className="text-xs text-slate-400 hover:text-brand-orange font-medium flex items-center justify-center gap-1.5 pt-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Portal Gateway</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
