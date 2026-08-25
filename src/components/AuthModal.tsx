import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, LogIn, Sparkles, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import {
  signInAnonymousUser,
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  logOutUser,
  User
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'guest'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        await registerWithEmail(email, password, name);
        setSuccessMsg('Account registered successfully! You are now signed in.');
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg('Welcome back! Signed in successfully.');
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message?.replace('Firebase: ', '') || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
      setSuccessMsg('Signed in with Google!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMsg(err.message?.replace('Firebase: ', '') || 'Google sign-in was closed or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInAnonymousUser(name || 'Anonymous Explorer');
      setSuccessMsg('Temporary explorer session initiated! Your trips will stay stored in Firestore.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Anonymous auth error:', err);
      setErrorMsg('Failed to start guest session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logOutUser();
      setSuccessMsg('Signed out safely.');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg('Error signing out.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#FFF9F0] border-3 border-[#4A3728] rounded-3xl p-6 sm:p-8 shadow-[16px_20px_0px_rgba(74,55,40,0.95)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border-2 border-[#4A3728] flex items-center justify-center text-[#4A3728] hover:bg-[#FBEFD4] transition-colors cursor-pointer shadow-[2px_2px_0px_rgba(74,55,40,0.9)]"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* User Profile State */
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-[#BFE3CE] border-2 border-[#4A3728] flex items-center justify-center mx-auto text-[#4A3728] font-serif-custom text-2xl font-bold shadow-[4px_4px_0px_rgba(74,55,40,0.9)]">
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email ? currentUser.email[0].toUpperCase() : 'E'}
            </div>

            <div>
              <span className="font-mono text-[10px] text-[#2E6E4E] bg-[#DFF3E4] px-2 py-0.5 rounded border border-[#2E6E4E]/30 font-bold uppercase">
                {currentUser.isAnonymous ? 'GUEST EXPLORER' : 'AUTHENTICATED'}
              </span>
              <h3 className="font-serif-custom text-2xl font-bold text-[#4A3728] mt-1">
                {currentUser.displayName || (currentUser.isAnonymous ? 'Anonymous Explorer' : 'TripSahay Member')}
              </h3>
              <p className="font-mono text-xs text-[#7a6a58] mt-0.5">
                {currentUser.email || `Session ID: ${currentUser.uid.substring(0, 10)}...`}
              </p>
            </div>

            <div className="bg-[#FFFDF8] border-2 border-[#4A3728] rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#4A3728]">
                <span className="font-mono text-[10px] text-[#7a6a58]">CLOUD PERSISTENCE</span>
                <span className="font-mono font-bold text-[#2E6E4E]">ONLINE (FIRESTORE)</span>
              </div>
              <div className="flex items-center justify-between text-[#4A3728]">
                <span className="font-mono text-[10px] text-[#7a6a58]">ENCRYPTION POSTURE</span>
                <span className="font-mono font-bold text-[#7A6BA8]">DPDP 2023 ZERO-KNOWLEDGE</span>
              </div>
            </div>

            {successMsg && (
              <div className="p-2.5 bg-[#DFF3E4] border border-[#2E6E4E] rounded-xl text-xs text-[#2E6E4E] font-medium flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#FFF9F0] border-2 border-[#4A3728] text-[#C96B4A] font-mono text-xs font-bold hover:bg-[#FBEFD4] shadow-[3px_3px_0px_rgba(74,55,40,0.85)] cursor-pointer"
            >
              {isLoading ? 'Signing Out...' : 'Sign Out of TripSahay'}
            </button>
          </div>
        ) : (
          /* Authentication Form */
          <div>
            <div className="font-mono text-xs tracking-widest text-[#C96B4A] font-bold mb-1">
              AUTHENTICATION &amp; CLOUD SYNC
            </div>

            <h3 className="font-serif-custom text-3xl font-normal text-[#4A3728]">
              {mode === 'login' && 'Sign in to TripSahay'}
              {mode === 'signup' && 'Create Explorer Account'}
              {mode === 'guest' && 'Guest Travel Session'}
            </h3>

            <p className="text-xs text-[#7a6a58] mt-1 font-light leading-relaxed">
              Sync your resurrected timelines, AI stories, and passport stamps across devices.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-[#F2E3C6]/60 p-1 rounded-xl border border-[#4A3728]/20 mt-5">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-white text-[#4A3728] shadow-sm' : 'text-[#7a6a58] hover:text-[#4A3728]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signup' ? 'bg-white text-[#4A3728] shadow-sm' : 'text-[#7a6a58] hover:text-[#4A3728]'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setMode('guest')}
                className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  mode === 'guest' ? 'bg-white text-[#4A3728] shadow-sm' : 'text-[#7a6a58] hover:text-[#4A3728]'
                }`}
              >
                Guest Pass
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-[#FEE2E2] border border-[#DC2626] rounded-xl text-xs text-[#DC2626] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 p-3 bg-[#DFF3E4] border border-[#2E6E4E] rounded-xl text-xs text-[#2E6E4E] font-medium flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'guest' ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1">
                    YOUR TRAVELER ALIAS
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Monsoon Pilgrim"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#4A3728] text-sm text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
                  />
                </div>
                <div className="text-xs text-[#7a6a58] leading-relaxed bg-[#FFFDF8] p-3 rounded-xl border border-[#4A3728]/15">
                  Guest passes assign an anonymous encrypted session token stored in Firestore. You can convert to an email account at any time.
                </div>
                <button
                  type="button"
                  onClick={handleGuestAuth}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-[#BFE3CE] text-[#4A3728] font-bold text-sm border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform cursor-pointer"
                >
                  {isLoading ? 'Starting Guest Session...' : 'Enter as Guest Explorer'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="mt-5 space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Varma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#4A3728] text-sm text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="explorer@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#4A3728] text-sm text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold text-[#4A3728] mb-1">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#4A3728] text-sm text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#F2765A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 rounded-full bg-[#F2765A] text-white font-semibold text-sm border-2 border-[#4A3728] shadow-[3px_3px_0px_rgba(74,55,40,0.95)] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform cursor-pointer"
                >
                  {isLoading ? 'Authenticating...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>

                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#4A3728]/20" />
                  </div>
                  <span className="relative bg-[#FFF9F0] px-3 font-mono text-[10px] text-[#7a6a58]">
                    OR CONTINUE WITH
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-white border-2 border-[#4A3728] text-[#4A3728] font-medium text-xs flex items-center justify-center gap-2 hover:bg-[#FBEFD4] shadow-[2px_2px_0px_rgba(74,55,40,0.85)] cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Account</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
