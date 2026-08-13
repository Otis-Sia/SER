import { Poppins } from 'next/font/google';
import Script from 'next/script';
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClientLogic from "../components/ClientLogic";
import FloatingActionButton from "../components/FloatingActionButton";
import JsonLd from "../components/JsonLd";
import "./globals.css";
import { getSiteContent } from "./admin/actions";
import { config } from '@/lib/config';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const baseUrl = (config.siteUrl || 'https://www.seresponse.org').replace(/\/$/, '');
const organizationId = `${baseUrl}/#organization`;
const websiteId = `${baseUrl}/#website`;

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = siteContent.siteMeta?.title || 'Scouts Emergency Response (SER)';
  const description = siteContent.siteMeta?.description || 'Scouts Emergency Response (SER) is a Kenyan youth-centered initiative equipping communities with first aid, emergency preparedness, and disaster response skills.';

  return {
    metadataBase: new URL(`${baseUrl}/`),
    title: {
      default: title,
      template: `%s | Scouts Emergency Response`,
    },
    description,
    keywords: [
      'Scouts Emergency Response',
      'Scouts Emergency Response Kenya',
      'SER Kenya',
      'first aid training Kenya',
      'emergency preparedness Kenya',
      'disaster response Kenya',
      'youth emergency response',
      'community safety Kenya',
      'Scouts Kenya',
    ],
    authors: [{ name: 'Scouts Emergency Response' }],
    creator: 'Scouts Emergency Response',
    publisher: 'Scouts Emergency Response',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: 'Scouts Emergency Response',
      locale: 'en_KE',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Scouts Emergency Response — Compassion in Action',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/icon.png',
      apple: '/icon.png',
    },
  };
}

export default async function RootLayout({ children }) {
  const siteContent = await getSiteContent();
  const osns = siteContent.siteMeta?.socialProfiles || [];
  const description = siteContent.siteMeta?.description || 'Scouts Emergency Response (SER) is a Kenyan youth-centered initiative equipping communities with first aid, emergency preparedness, and disaster response skills.';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: 'Scouts Emergency Response',
    alternateName: 'SER',
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    image: `${baseUrl}/og-image.jpg`,
    description,
    areaServed: {
      '@type': 'Country',
      name: 'Kenya',
    },
    knowsAbout: [
      'First aid',
      'Emergency preparedness',
      'Disaster response',
      'Community safety',
      'Youth empowerment',
      'Scout emergency response',
    ],
    sameAs: osns.map((social) => social.url).filter(Boolean),
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: 'Scouts Emergency Response',
    alternateName: 'SER',
    url: `${baseUrl}/`,
    publisher: { '@id': organizationId },
    inLanguage: 'en-KE',
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="G9LZrVdjCKWCmmaGjO-XgPSIXGyNXh-G72vRLJGrfm4" />
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <script
          id="theme-init"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ser-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark-mode');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className={`${poppins.variable} ${poppins.className}`} suppressHydrationWarning>
        <Header navigation={siteContent.navigation} siteMeta={siteContent.siteMeta} />
        <main>{children}</main>
        <Footer osns={osns} siteContent={siteContent} />
        <FloatingActionButton />
        <ClientLogic />
      </body>
    </html>
  );
}
