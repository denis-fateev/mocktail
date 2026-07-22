import { useState } from 'react';
import { DEFAULT_HTTP_STATUS_CODE } from '@shared/rules/defaults';
import { filterStatusCodeInput, normalizeStatusCodeInput } from '@shared/rules/status-code';
import styles from './RuleTextField.module.css';

type RuleStatusCodeFieldProps = {
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (statusCode: number) => void;
};

export const RuleStatusCodeField = ({ label, value, disabled = false, onChange }: RuleStatusCodeFieldProps) => {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type="text"
        inputMode="numeric"
        maxLength={3}
        value={focused ? draft : String(value)}
        disabled={disabled}
        placeholder={String(DEFAULT_HTTP_STATUS_CODE)}
        onFocus={() => {
          setDraft(String(value));
          setFocused(true);
        }}
        onChange={(event) => setDraft(filterStatusCodeInput(event.target.value))}
        onBlur={() => {
          const normalized = normalizeStatusCodeInput(draft);
          setFocused(false);
          if (normalized !== value) {
            onChange(normalized);
          }
        }}
      />
    </label>
  );
};
