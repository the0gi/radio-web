import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Monitor, Moon, Sun, X } from 'lucide-react';

type Theme = 'system' | 'light' | 'dark';
type Props = { theme: Theme; onThemeChange: (theme: Theme) => void; onClose: () => void };

export default function SettingsSheet({ theme, onThemeChange, onClose }: Props) {
 const close = useRef<HTMLButtonElement>(null);
 useEffect(() => {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const overflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  close.current?.focus();
  return () => { document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
 }, []);
 return createPortal(<div className="modal-backdrop settings-backdrop" onClick={onClose}>
  <section className="settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={event => event.stopPropagation()} onKeyDown={event => {
   if (event.key === 'Escape') onClose();
   if (event.key === 'Tab') {
    const controls = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
   }
  }}>
   <div className="sheet-handle" aria-hidden="true"/>
   <header><h2 id="settings-title">Settings</h2><button ref={close} aria-label="Close settings" onClick={onClose}><X size={22}/></button></header>
   <div className="settings-panel"><h3>Appearance</h3><p>Automatic follows your device’s appearance</p>
    <div className="theme-options">{([['system', 'Automatic', Monitor], ['light', 'Light', Sun], ['dark', 'Dark', Moon]] as const).map(([value, label, Icon]) => <button key={value} className={theme === value ? 'selected' : ''} aria-pressed={theme === value} onClick={() => onThemeChange(value)}><Icon size={22}/>{label}{theme === value && <Check size={16}/>}</button>)}</div>
   </div>
  </section>
 </div>, document.body);
}
