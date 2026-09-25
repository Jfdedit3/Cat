import "./globals.css";

export const metadata = {
  title: "Cat — File Gallery",
  description: "Upload, preview and manage files.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
