import type { CSSProperties } from 'react';
import {
  toggleConfusionTab,
  type ConfusionTabDef,
  type ConfusionTabId,
} from '../types/analysis';

type Props = {
  tabs: ConfusionTabDef[];
  activeTabs: Set<ConfusionTabId>;
  onChange: (next: Set<ConfusionTabId>) => void;
  style?: CSSProperties;
};

export default function AnalysisConfusionTabs({ tabs, activeTabs, onChange, style }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, ...style }}>
      {tabs.map((tab) => {
        const on = activeTabs.has(tab.id);
        const isLetter = ['A', 'B', 'C', 'D'].includes(tab.id);
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(toggleConfusionTab(activeTabs, tab.id))}
            style={{
              padding: isLetter ? 0 : '6px 10px',
              width: isLetter ? 32 : undefined,
              height: isLetter ? 32 : undefined,
              borderRadius: 999,
              border: on ? 'none' : '1px solid rgba(0,0,0,0.08)',
              background: on ? '#003459' : '#fff',
              color: on ? '#fff' : '#8E98A8',
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 'normal',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
