import React from 'react';

const variantClasses = {
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-slate-200 bg-slate-50 text-slate-800',
};

const descriptionClasses = {
  error: 'text-rose-700',
  warning: 'text-amber-700',
  info: 'text-slate-600',
};

export function ErrorAlert({
  title,
  message,
  variant = 'error',
  actions = [],
  onDismiss,
  className = '',
}) {
  const tone = variantClasses[variant] || variantClasses.error;
  const descriptionTone = descriptionClasses[variant] || descriptionClasses.error;

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${tone} ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          {message ? <p className={`text-sm ${descriptionTone}`}>{message}</p> : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full border border-current/15 px-2.5 py-1 text-xs font-semibold"
          >
            Chiudi
          </button>
        ) : null}
      </div>
      {actions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="rounded-lg border border-current/15 px-3 py-1.5 text-xs font-semibold"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LoadingState({ label = 'Caricamento in corso...', compact = false, className = '' }) {
  return (
    <div
      className={[
        'rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm',
        compact ? 'px-4 py-3 text-sm' : 'px-5 py-6 text-sm',
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'Nessun elemento disponibile.',
  description,
  action,
  className = '',
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white px-5 py-6 text-slate-700 shadow-sm ${className}`.trim()}>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
