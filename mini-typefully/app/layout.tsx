import './globals.css';
import React from 'react';
import Providers from './providers';

export const metadata = {
  title: 'Mini Typefully',
  description: 'Private tweet scheduler',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <h1>Mini Typefully</h1>
          <p className="small">Private tweet scheduler</p>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
