'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_STATE_COOKIE = 'khmc_admin_auth_state';

export default function AdminSessionRefresh() {
  const router = useRouter();

  useEffect(() => {
    let last = document.cookie.includes(`${AUTH_STATE_COOKIE}=1`);

    const check = () => {
      const current = document.cookie.includes(`${AUTH_STATE_COOKIE}=1`);
      if (current !== last) {
        last = current;
        router.refresh();
      }
    };

    const timer = window.setInterval(check, 300);
    return () => window.clearInterval(timer);
  }, [router]);

  return null;
}
