'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const ALERT_DURATION_MS = 5000;

const subscribeNoop = () => () => {};

interface FormAlertProps {
  message?: string;
  type?: 'error' | 'success';
  /** A new value (by identity) marks a new occurrence, so a repeated identical message shows again. */
  trigger?: unknown;
}

export function FormAlert({ message, type = 'error', trigger = message }: FormAlertProps) {
  const [occurrence, setOccurrence] = useState({ trigger, count: 0 });
  const [dismissed, setDismissed] = useState<number | null>(null);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  if (!Object.is(occurrence.trigger, trigger)) {
    setOccurrence({ trigger, count: occurrence.count + 1 });
  }

  const { count } = occurrence;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setDismissed(count), ALERT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, count]);

  if (!mounted || !message || dismissed === count) return null;

  return createPortal(
    <div className="jp-form-toast" key={count}>
      <div className={`jp-alert is-${type}`} role={type === 'error' ? 'alert' : 'status'}>
        {type === 'success' ? (
          <CheckCircle2 size={18} className="shrink-0" aria-hidden />
        ) : (
          <AlertCircle size={18} className="shrink-0" aria-hidden />
        )}
        <span className="jp-form-toast-text">{message}</span>
        <button
          type="button"
          onClick={() => setDismissed(count)}
          className="jp-form-toast-close"
          aria-label="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
