import { ChevronDown, LayoutGrid, List, Search, X } from 'lucide-react';

export type FavoritesSort = 'newest' | 'oldest' | 'name_asc' | 'name_desc';
export type FavoritesViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: FavoritesSort; label: string }[] = [
  { value: 'newest', label: 'Newest Saved' },
  { value: 'oldest', label: 'Oldest Saved' },
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
];

const VIEW_MODES = [
  { value: 'grid', label: 'Grid view', Icon: LayoutGrid },
  { value: 'list', label: 'List view', Icon: List },
] as const;

interface FavoritesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: FavoritesSort;
  onSortChange: (value: FavoritesSort) => void;
  viewMode: FavoritesViewMode;
  onViewModeChange: (value: FavoritesViewMode) => void;
}

export function FavoritesToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: FavoritesToolbarProps) {
  return (
    <section
      className="mb-5 flex flex-col justify-between gap-3 border border-[#e4e5e8] bg-white p-3 shadow-xs lg:flex-row lg:items-center"
      aria-label="Filter and search candidates"
    >
      <div className="relative min-w-0 flex-1">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#767f8c]"
          aria-hidden
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by candidate name, role, or title…"
          aria-label="Search saved candidates"
          className="h-9 w-full border border-[#e4e5e8] bg-[#f8f9fa] pl-9 pr-9 text-[13px] text-[#18191c] outline-none transition-colors placeholder:text-[#9199a3] hover:bg-[#f1f2f4] focus:border-[#0a65cc] focus:bg-white"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#767f8c] transition-colors hover:text-[#18191c]"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as FavoritesSort)}
            aria-label="Sort candidates"
            className="h-8 cursor-pointer appearance-none border border-[#e4e5e8] bg-[#f8f9fa] pl-3 pr-8 text-xs font-semibold text-[#18191c] outline-none transition-colors hover:bg-[#f1f2f4] focus:border-[#0a65cc]"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-[#767f8c]" aria-hidden />
        </div>

        <div className="flex items-center border border-[#e4e5e8] bg-[#f8f9fa] p-0.5">
          {VIEW_MODES.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onViewModeChange(value)}
              aria-label={label}
              aria-pressed={viewMode === value}
              title={label}
              className={`border p-1 transition-all ${
                viewMode === value
                  ? 'border-[#e4e5e8] bg-white text-[#0a65cc] shadow-xs'
                  : 'border-transparent text-[#767f8c] hover:text-[#18191c]'
              }`}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
