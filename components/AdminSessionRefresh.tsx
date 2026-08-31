'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_STATE_COOKIE = 'khmc_admin_auth_state';
const ADMIN_NAME_COOKIE = 'khmc_admin_name';

function getCookie(name: string) {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=').slice(1).join('=');
  return value ? decodeURIComponent(value) : '';
}

function updateGreeting() {
  const name = getCookie(ADMIN_NAME_COOKIE);
  if (!name) return;
  const heading = Array.from(document.querySelectorAll('h1')).find(
    (el) => el.textContent?.trim() === 'Good day, Administrator'
  );
  if (heading) heading.textContent = `Good day, ${name}`;
}

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
      updateGreeting();
    };

    updateGreeting();
    const timer = window.setInterval(check, 300);
    return () => window.clearInterval(timer);
  }, [router]);

  return null;
}
