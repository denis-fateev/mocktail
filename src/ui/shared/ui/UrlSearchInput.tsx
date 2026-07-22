import styles from './UrlSearchInput.module.css';

type UrlSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const UrlSearchInput = ({
  value,
  onChange,
  placeholder = 'Search by URL…',
  disabled = false,
  className,
}: UrlSearchInputProps) => (
  <label className={className ? `${styles.field} ${className}` : styles.field}>
    <span className={styles.caption}>Search</span>
    <input
      className={styles.input}
      type="search"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);
