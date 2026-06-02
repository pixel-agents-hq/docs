import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'crt-enabled';

export default function CrtToggle(): React.ReactElement {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isEnabled = stored !== 'false';
    setEnabled(isEnabled);
    if (!isEnabled) {
      document.documentElement.classList.add('crt-off');
    }
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    if (next) {
      document.documentElement.classList.remove('crt-off');
    } else {
      document.documentElement.classList.add('crt-off');
    }
  };

  return (
    <button
      onClick={toggle}
      className="crt-toggle-btn"
      title={enabled ? 'Disable CRT effect' : 'Enable CRT effect'}
      style={{ opacity: enabled ? 1 : 0.5 }}
    >
      CRT
    </button>
  );
}
