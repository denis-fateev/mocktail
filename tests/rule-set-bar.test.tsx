import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RuleSetBar } from '../src/ui/features/rule-set/ui/RuleSetBar';

const defaultProps = {
  sets: [{ id: 'set-1', name: 'Default', ruleCount: 1 }],
  activeSetId: 'set-1',
  loading: false,
  onSwitch: vi.fn(async () => 'set-1'),
  onCreate: vi.fn(async () => 'set-1'),
  onRename: vi.fn(),
  onDelete: vi.fn(async () => 'set-1'),
  onImport: vi.fn(async () => null),
};

describe('RuleSetBar export', () => {
  it('updates the exported text while the export panel is open', () => {
    const { rerender } = render(<RuleSetBar {...defaultProps} exportText="first export" />);

    fireEvent.click(screen.getByRole('button', { name: 'Rule set actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Export' }));

    const exportTextarea = screen.getByRole('textbox', { name: 'Exported rule set JSON' });
    expect(exportTextarea).toHaveValue('first export');

    rerender(<RuleSetBar {...defaultProps} exportText="updated export" />);

    expect(exportTextarea).toHaveValue('updated export');
  });
});
