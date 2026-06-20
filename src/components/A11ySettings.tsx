import React, { useState, useEffect } from 'react';
import { Eye, Type, Volume2, Accessibility, HelpCircle, Sparkles, Check } from 'lucide-react';

interface A11ySettingsProps {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  textSize: 'normal' | 'large' | 'extra';
  setTextSize: (val: 'normal' | 'large' | 'extra') => void;
  screenReaderActive: boolean;
  setScreenReaderActive: (val: boolean) => void;
}

export default function A11ySettings({
  highContrast,
  setHighContrast,
  textSize,
  setTextSize,
  screenReaderActive,
  setScreenReaderActive
}: A11ySettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    if ('speechSynthesis' in window && screenReaderActive) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = 'pt-PT';
      window.speechSynthesis.speak(utterance);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleContrast = () => {
    const nextValue = !highContrast;
    setHighContrast(nextValue);
    showNotification(nextValue ? "Modo de alto contraste ativado." : "Modo de contraste padrão ativado.");
  };

  const handleTextScale = (size: 'normal' | 'large' | 'extra') => {
    setTextSize(size);
    const sizeLabel = size === 'normal' ? 'padrão 100%' : size === 'large' ? 'ampliado 125%' : 'extra ampliado 150%';
    showNotification(`Tamanho do texto alterado para ${sizeLabel}.`);
  };

  const toggleScreenReader = () => {
    const nextVal = !screenReaderActive;
    setScreenReaderActive(nextVal);
    showNotification(nextVal ? "Leitor de ecrã simulado ativado. Ao clicar nos elementos, ouvirá a narração acessível." : "Leitor de ecrã desativado.");
  };

  return (
    <div className="relative z-[90]">
      {/* Accessibility Badge Button */}
      <button
        id="a11y-badge-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full font-sans font-medium text-xs shadow-sm transition-all focus:ring-4 focus:ring-green-400 focus:outline-none ${
          highContrast
            ? 'bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300'
            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
        }`}
        aria-label="Opções de Acessibilidade. WCAG 2.1"
      >
        <Accessibility className="w-4.5 h-4.5 animate-pulse" />
        <span className="hidden sm:inline">Acessibilidade Portuguesa (WCAG 2.1)</span>
        <span className="sm:hidden">Acessibilidade</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="a11y-dropdown-panel"
          className={`absolute right-0 mt-2 w-80 p-4 rounded-xl shadow-xl border font-sans animate-in fade-in slide-in-from-top-2 duration-200 ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-white text-slate-800 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm flex items-center gap-1.5 leading-none">
              <Accessibility className="w-4 h-4 text-emerald-500" />
              Recursos de Acessibilidade
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-emerald-500 text-white leading-none">
              WCAG 2.1 AA
            </span>
          </div>

          <div className="space-y-4">
            {/* Contrast Toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Contraste de Cores</span>
              <button
                onClick={toggleContrast}
                className={`w-full py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Alto Contraste</span>
                </div>
                <span>{highContrast ? 'ATIVO' : 'DESATIVADO'}</span>
              </button>
            </div>

            {/* Font Scale Options */}
            <div className="flex flex-col gap-1.5 pb-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tamanho de Fonte Adaptável</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'normal', label: '100%', full: 'Normal' },
                  { key: 'large', label: '125%', full: 'Ampliado' },
                  { key: 'extra', label: '150%', full: 'Extra' }
                ].map((scale) => {
                  const active = textSize === scale.key;
                  return (
                    <button
                      key={scale.key}
                      onClick={() => handleTextScale(scale.key as any)}
                      className={`py-1.5 rounded-md text-xs font-medium border flex flex-col items-center justify-center transition-all ${
                        active
                          ? highContrast
                            ? 'bg-white text-black border-yellow-400 border-2'
                            : 'bg-emerald-600 text-white border-emerald-700'
                          : highContrast
                          ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm font-bold">{scale.label}</span>
                      <span className="text-[9px] opacity-80">{scale.full}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Screen Reader Narrator Toggle */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Feedback de Áudio (Acessibilidade Sonora)</span>
              <button
                onClick={toggleScreenReader}
                className={`w-full py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
                  screenReaderActive
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-500'
                      : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500'
                    : highContrast
                    ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span>Leitor de Ecrã Integrado</span>
                </div>
                <span>{screenReaderActive ? 'ATIVO' : 'DESATIVADO'}</span>
              </button>
              <p className="text-[10px] text-slate-400 leading-tight">
                Simula um sintetizador áudio que lê descrições ricas em conformidade com as marcações cognitivas da ARIA.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Navegue usando o teclado através da tecla [Tab]</span>
          </div>
        </div>
      )}

      {/* Screen reader Notification Banner (Toast) */}
      {notification && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-4 left-4 z-[999] px-4 py-3 rounded-lg font-sans font-medium text-xs flex items-center gap-2 shadow-2xl animate-bounce bg-slate-900 text-white border border-emerald-500"
        >
          <Sparkles className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
