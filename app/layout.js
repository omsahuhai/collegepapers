import '../styles/globals.css';

export const metadata = {
  title: 'Previous Year Question Papers | Chhattisgarh Academic Portal',
  description: 'Download Previous Year Question Papers (PYQs) for Pt. Ravishankar Shukla University (PRSU), CSVTU, Amity University, and Kalinga University instantly.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
