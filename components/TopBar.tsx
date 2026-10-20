'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SITE } from '@/lib/data';

export default function TopBar() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => { try { setTime(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date())); } catch { /* ignore */ } };
    fmt(); const id = setInterval(fmt, 15000); return () => clearInterval(id);
  }, []);
  return (
    <div className="top">
      <div className="w">
        <Link className="me" href="/">Snehangshu Roy <span>· systems + AI</span></Link>
        <span className="clock" suppressHydrationWarning>Bengaluru {time || '--:--'}</span>
        <a className="res" href={SITE.resume} target="_blank" rel="noopener">Résumé <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" /></svg></a>
        <Link className="avail" href="/#contact">Available for contract work</Link>
      </div>
    </div>
  );
}
