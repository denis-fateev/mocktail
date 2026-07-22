import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { IconCopy, IconCopySuccess } from '@ui/shared/ui/icons';
import styles from './CopyButton.module.css';

const COPY_FEEDBACK_MS = 1500;

type CopyButtonProps = {
  value: string;
  label: string;
};

async function copyTextToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export const CopyButton = ({ value, label }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const didCopy = await copyTextToClipboard(value);
    if (!didCopy) return;

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={(event) => {
        void handleClick(event);
      }}
      title={copied ? 'Copied' : label}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? <IconCopySuccess size={12} /> : <IconCopy size={12} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};
