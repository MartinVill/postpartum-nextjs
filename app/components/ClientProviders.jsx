'use client';
import { ReactNode } from 'react';
import ServiceWorkerRegister from './ServiceWorkerRegister';

export default function ClientProviders({ children }) {
  return (
    <>
      <ServiceWorkerRegister />
      {children}
    </>
  );
}
