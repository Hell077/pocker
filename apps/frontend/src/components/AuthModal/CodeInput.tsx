import React, { useRef } from 'react';
import styles from './CodeInput.module.css';

type Props = {
  length?: number;
  onComplete: (code: string) => void;
};

const CodeInput: React.FC<Props> = ({ length = 6, onComplete }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const current = inputsRef.current[index];
    if (current) current.value = value;

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const code = inputsRef.current.map((input) => input?.value).join('');
    if (code.length === length && !code.includes('')) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    const current = inputsRef.current[index];
    if (!current) return;

    if (e.key === 'Backspace') {
      if (current.value === '') {
        inputsRef.current[index - 1]?.focus();
      } else {
        current.value = '';
      }
    }

    if (e.key === 'ArrowLeft') {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight') {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <div className={styles.codeContainer}>
      {[...Array(length)].map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          className={styles.codeInput}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          ref={(el) => (inputsRef.current[i] = el)}
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default CodeInput;
