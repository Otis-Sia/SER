import Header from "../components/Header";
import Footer from "../components/Footer";
import ClientLogic from "../components/ClientLogic";
import "./globals.css";

export const metadata = {
  title: "Scouts Emergency Response",
  description: "Compassion in Action - Scouts Emergency Response",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
        <ClientLogic />
      </body>
    </html>
  );
}
