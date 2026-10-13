'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  // Sembunyikan navbar utama di semua route /admin/*
  if (pathname?.startsWith('/admin')) return null;
  return <Navbar />;
}
