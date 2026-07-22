import { useState } from 'react';
import { DEFAULT_DELAY_MS } from '@shared/rules/defaults';
import { filterDelayInput, normalizeDelayInput } from '@shared/rules/delay-ms';
import styles from './RuleTextField.module.css';

type RuleDelayFieldProps = {
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (delayMs: number) => void;
};

export const RuleDelayField = ({ label, value, disabled = false, onChange }: RuleDelayFieldProps) => {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={focused ? draft : String(value)}
        disabled={disabled}
        placeholder={String(DEFAULT_DELAY_MS)}
        title="Delay in milliseconds"
        onFocus={() => {
          setDraft(String(value));
          setFocused(true);
        }}
        onChange={(event) => setDraft(filterDelayInput(event.target.value))}
        onBlur={() => {
          const normalized = normalizeDelayInput(draft);
          setFocused(false);
          if (normalized !== value) {
            onChange(normalized);
          }
        }}
      />
    </label>
  );
};
