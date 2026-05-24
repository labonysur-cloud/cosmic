import "./globals.css";

export const metadata = {
  title: "Cosmic Origin | The Universe On The Night You Arrived",
  description: "An immersive cinematic experience reconstructing the universe at the exact moment of your birth.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
