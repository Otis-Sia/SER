import Header from "../components/Header";
import Footer from "../components/Footer";
import ClientLogic from "../components/ClientLogic";
import FloatingActionButton from "../components/FloatingActionButton";
import JsonLd from "../components/JsonLd";
import "./globals.css";
import { getSiteContent } from "./admin/actions";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seresponse.org';

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = siteContent.siteMeta?.title || 'Scouts Emergency Response (SER)';
  const description = siteContent.siteMeta?.description || 'Empowering youth with emergency preparedness, first aid training, and community disaster response skills.';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | Scouts Emergency Response`,
    },
    description: description,
    keywords: [
      'Scouts Emergency Response',
      'SER Kenya',
      'Emergency Preparedness',
      'First Aid Training',
      'Disaster Response',
      'Youth Empowerment',
      'Community Safety',
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
      canonical: './',
    },
    openGraph: {
      title: title,
      description: description,
      url: baseUrl,
      siteName: title,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/icon.svg',
          width: 800,
          height: 800,
          alt: 'Scouts Emergency Response Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['/icon.svg'],
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
      icon: '/icon.svg',
      apple: '/icon.svg',
    },
  };
}

export default async function RootLayout({ children }) {
  const siteContent = await getSiteContent();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EmergencyService',
    name: 'Scouts Emergency Response',
    alternateName: 'SER',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    description: siteContent.siteMeta?.description || 'Empowering youth with emergency preparedness, first aid training, and community disaster response skills.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KE',
    },
    sameAs: (siteContent.siteMeta?.osns || []).map((social) => social.link).filter(Boolean),
  };

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="google-site-verification" content="G9LZrVdjCKWCmmaGjO-XgPSIXGyNXh-G72vRLJGrfm4" />
        <JsonLd data={organizationSchema} />
      </head>
      <body suppressHydrationWarning>
        <Header navigation={siteContent.navigation} />
        <main>{children}</main>
        <Footer osns={siteContent.siteMeta?.osns} />
        <FloatingActionButton />
        <ClientLogic />
      </body>
    </html>
  );
}
