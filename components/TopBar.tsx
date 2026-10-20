'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
        <Link className="avail" href="/#contact">Available for contract work</Link>
      </div>
    </div>
  );
}
