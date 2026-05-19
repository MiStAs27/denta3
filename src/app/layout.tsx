import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DentaSync | Dental Management SaaS',
  description: 'AI-Powered Dental Clinic Optimization Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/10 selection:text-primary">{children}</body>
    </html>
  );
}