'use client';

import { Settings, ImageIcon, Code2, MessageSquare, Clock, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  showSettings: boolean;
  onToggleSettings: () => void;
  onDelete: () => void;
}

interface AsideBtnProps {
  title: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}

function AsideBtn({ title, onClick, active = false, danger = false, children }: AsideBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: '48px',
        height: '48px',
        display: 'grid',
        placeItems: 'center',
        border: `1px solid ${danger ? 'var(--destructive)' : active ? 'var(--foreground)' : 'transparent'}`,
        background: active ? 'var(--foreground)' : 'transparent',
        color: danger ? 'var(--destructive)' : active ? 'var(--background)' : 'var(--muted-foreground)',
        cursor: 'pointer',
        transition: 'border-color 120ms, background 120ms, color 120ms',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget;
        if (!active && !danger) {
          btn.style.borderColor = 'var(--border)';
        }
        if (danger) {
          btn.style.background = 'var(--destructive)';
          btn.style.color = 'var(--background)';
        }
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget;
        if (!active && !danger) {
          btn.style.borderColor = 'transparent';
        }
        if (danger) {
          btn.style.background = 'transparent';
          btn.style.color = 'var(--destructive)';
        }
      }}
    >
      {children}
    </button>
  );
}

function AsideDivider() {
  return (
    <div
      aria-hidden
      style={{
        width: '32px',
        height: '1px',
        background: 'var(--border)',
        margin: '8px 0',
        flexShrink: 0,
      }}
    />
  );
}

export function EditorAside({ showSettings, onToggleSettings, onDelete }: Props) {
  return (
    <aside
      style={{
        borderLeft: '1px solid var(--border)',
        width: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        gap: '4px',
        background: 'var(--card)',
        flexShrink: 0,
      }}
      aria-label="Editor tools"
    >
      <AsideBtn title="Settings" onClick={onToggleSettings} active={showSettings}>
        <Settings size={18} aria-hidden />
      </AsideBtn>
      <AsideBtn title="Add media" onClick={() => toast('Media library coming soon')}>
        <ImageIcon size={18} aria-hidden />
      </AsideBtn>
      <AsideBtn title="Embed" onClick={() => toast('Embeds coming soon')}>
        <Code2 size={18} aria-hidden />
      </AsideBtn>

      <AsideDivider />

      <AsideBtn title="Comments" onClick={() => toast('Comments coming soon')}>
        <MessageSquare size={18} aria-hidden />
      </AsideBtn>
      <AsideBtn title="Version history" onClick={() => toast('Version history coming soon')}>
        <Clock size={18} aria-hidden />
      </AsideBtn>
      <AsideBtn title="Preview" onClick={() => toast('Preview coming soon')}>
        <Eye size={18} aria-hidden />
      </AsideBtn>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <AsideBtn title="Delete draft" onClick={onDelete} danger>
        <Trash2 size={18} aria-hidden />
      </AsideBtn>
    </aside>
  );
}
