import React, { useEffect, type ReactNode } from 'react';

const STORAGE_KEY = 'crt-enabled';

export default function Root({ children }: { children: ReactNode }): ReactNode {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'false') {
      document.documentElement.classList.add('crt-off');
    }
  }, []);

  return <>{children}</>;
}
