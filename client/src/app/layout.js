import Header from "../components/Header";
import Footer from "../components/Footer";
import ClientLogic from "../components/ClientLogic";
import FloatingActionButton from "../components/FloatingActionButton";
import "./globals.css";
import { getSiteContent } from "./admin/actions";

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  return {
    title: siteContent.siteMeta.title,
    description: siteContent.siteMeta.description,
    openGraph: {
      title: siteContent.siteMeta.title,
      description: siteContent.siteMeta.description,
      siteName: siteContent.siteMeta.title,
      type: 'website',
    },
  };
}

export default async function RootLayout({ children }) {
  const siteContent = await getSiteContent();
  
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <Header navigation={siteContent.navigation} />
        <main>
          {children}
        </main>
        <Footer osns={siteContent.siteMeta.osns} />
        <FloatingActionButton />
        <ClientLogic />
      </body>
    </html>
  );
}
