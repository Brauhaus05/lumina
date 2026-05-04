'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { SlashCommandItem } from '../extensions/SlashCommand';

interface Props {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashMenu = forwardRef<SlashMenuHandle, Props>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="z-50 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
      {items.length === 0 ? (
        <p className="px-3 py-2 text-sm text-zinc-500">No results</p>
      ) : (
        items.map((item, index) => (
          <button
            key={item.label}
            onClick={() => command(item)}
            className={`flex w-full flex-col px-3 py-2 text-left transition-colors ${
              index === selectedIndex ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
            }`}
          >
            <span className="text-sm font-medium text-zinc-100">{item.label}</span>
            <span className="text-xs text-zinc-500">{item.description}</span>
          </button>
        ))
      )}
    </div>
  );
});

SlashMenu.displayName = 'SlashMenu';
