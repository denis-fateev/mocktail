import type { SelectOption } from '@features/mock-rule/model/rule-config-types';
import styles from './RuleSelectField.module.css';

type RuleSelectFieldProps<T extends string> = {
  label: string;
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
};

export const RuleSelectField = <T extends string>({
  label,
  options,
  value,
  defaultValue,
  onChange,
  disabled,
}: RuleSelectFieldProps<T>) => (
  <label className={styles.field}>
    <span className={styles.label}>{label}</span>
    <select
      className={styles.select}
      value={value}
      // TODO: make always controlled state
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={(event) => onChange?.(event.target.value as T)}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
