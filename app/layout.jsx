import "./globals.css";

export const metadata = {
  title: "Prana LP Intake",
  description: "Secure intake form for prospective LPs and SPV data collection.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
