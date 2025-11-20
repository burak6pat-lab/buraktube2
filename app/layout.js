import './globals.css';

export const metadata = {
  title: 'YouTube Trend Analyzer',
  description: 'Analyze fast-growing videos with filters and AI sorting',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}
