import styles from './MockingControls.module.css';
import { IconPlay, IconSquare } from '@ui/shared/ui/icons';

type MockingControlsProps = {
  enabled: boolean;
  busy: boolean;
  disabled: boolean;
  error: string | null;
  onToggle: () => void;
  variant?: 'default' | 'banner';
};

export const MockingControls = ({
  enabled,
  busy,
  disabled,
  error,
  onToggle,
  variant = 'default',
}: MockingControlsProps) => {
  const isBanner = variant === 'banner';

  return (
    <div className={isBanner ? styles.banner : styles.default}>
      <button
        type="button"
        className={enabled ? styles.stopButton : styles.startButton}
        onClick={onToggle}
        disabled={disabled}
      >
        {busy ? (
          '…'
        ) : enabled ? (
          <>
            <IconSquare size={14} className={styles.buttonIcon} />
            Stop mocking
          </>
        ) : (
          <>
            <IconPlay size={14} className={styles.buttonIcon} />
            Start mocking
          </>
        )}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};
