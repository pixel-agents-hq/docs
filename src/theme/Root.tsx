import React, { useEffect, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';

const STORAGE_KEY = 'crt-enabled';

function CrtToggle() {
  const [enabled, setEnabled] = React.useState(true);

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

export default function Root({ children }: { children: ReactNode }): ReactNode {
  useEffect(() => {
    const inject = () => {
      const rightItems = document.querySelector('.navbar__items--right');
      if (!rightItems || rightItems.querySelector('.crt-toggle-root')) return;

      const container = document.createElement('div');
      container.className = 'crt-toggle-root';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      rightItems.insertBefore(container, rightItems.firstChild);

      const root = ReactDOM.createRoot(container);
      root.render(<CrtToggle />);
    };

    inject();
    // Retry for client-side nav where navbar re-renders
    const observer = new MutationObserver(() => {
      if (!document.querySelector('.crt-toggle-root')) {
        inject();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
