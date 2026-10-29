import type { ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ListHeaderProps {
  title: string;
  addLabel: string;
  onAdd: () => void;
}

export function ListHeader({ title, addLabel, onAdd }: ListHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="cset-section-title !m-0">{title}</h3>
      <button type="button" onClick={onAdd} className="cset-btn-secondary cset-btn-xs">
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}

export function EmptyList({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-gray-200 rounded">{children}</p>
  );
}

export function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
    >
      <Trash2 className="w-3.5 h-3.5" /> Remove
    </button>
  );
}

interface EntryCardProps {
  onRemove: () => void;
  footerStart?: ReactNode;
  children: ReactNode;
}

export function EntryCard({ onRemove, footerStart, children }: EntryCardProps) {
  return (
    <div className="cset-entry-card">
      {children}
      <div className={`mt-3 flex items-center ${footerStart ? 'justify-between' : 'justify-end'}`}>
        {footerStart}
        <RemoveButton onClick={onRemove} />
      </div>
    </div>
  );
}
