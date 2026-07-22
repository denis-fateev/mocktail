import styles from './RuleTextField.module.css';

type RuleTextFieldProps = {
  label: string;
  defaultValue: string;
  inputMode?: 'numeric' | 'text';
};

export const RuleTextField = ({ label, defaultValue, inputMode = 'text' }: RuleTextFieldProps) => (
  <label className={styles.field}>
    <span className={styles.label}>{label}</span>
    <input
      className={styles.input}
      type="text"
      inputMode={inputMode}
      defaultValue={defaultValue}
    />
  </label>
);
