import React, { useState } from 'react';

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  decimals?: boolean;
  min?: number;
  max?: number;
  className?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  unit = 'đ',
  decimals = false,
  min,
  max,
  className,
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const shown = decimals
    ? `${value.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${unit}`
    : `${Math.round(value).toLocaleString('vi-VN')} ${unit}`;

  const commit = (raw: string) => {
    const parsed = decimals ? parseFloat(raw) : parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return (
    <input
      type="text"
      inputMode={decimals ? 'decimal' : 'numeric'}
      value={editing ? text : shown}
      onFocus={(event) => {
        setText(decimals ? String(value) : String(Math.round(value)));
        setEditing(true);
        requestAnimationFrame(() => event.target.select());
      }}
      onBlur={() => {
        setEditing(false);
        let next = value;
        if (min != null && next < min) next = min;
        if (max != null && next > max) next = max;
        if (next !== value) onChange(next);
      }}
      onChange={(event) => {
        const raw = decimals
          ? event.target.value.replace(/[^\d.,]/g, '').replace(',', '.')
          : event.target.value.replace(/\D/g, '');
        setText(raw);
        onChange(commit(raw));
      }}
      className={className}
    />
  );
};
