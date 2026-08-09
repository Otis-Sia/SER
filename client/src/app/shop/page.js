import Link from 'next/link';
import { getProducts, getSiteContent } from '../admin/actions';

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = 'Official Shop & Gear | Scouts Emergency Response';
  const description = 'Support Scouts Emergency Response (SER) by purchasing official merchandise, emergency kits, badges, and safety gear.';
  const rawImage = siteContent.siteMeta?.shopHeroBgImage;
  const heroImage = (rawImage && (rawImage.endsWith('.jpg') || rawImage.endsWith('.png') || rawImage.startsWith('http')))
    ? rawImage
    : '/assets/images/backgrounds/scouts_hero_bg.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/shop',
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: 'SER Official Shop & Gear',
        },
      ],
    },
    alternates: {
      canonical: '/shop',
    },
  };
}

export default async function Shop() {
  const products = await getProducts();
  const siteContent = await getSiteContent();
  const featuredProducts = products.filter(p => p.featured);

  return (
    <>
      <section 
        className="shop-hero page-hero"
        style={siteContent.siteMeta?.shopHeroBgImage ? { '--hero-bg': `url(${siteContent.siteMeta.shopHeroBgImage})` } : {}}
      >
        <h1>Welcome to the SER Shop</h1>
        <p>Support SER through official merchandise and essential safety items.</p>
        <Link href="/shop" className="btn">Shop Now</Link>
      </section>

      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid" id="featured-products-grid">
          {featuredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              )}
              <div className="product-card-info">
                <h3>{product.name}</h3>
                <p><strong>Price:</strong> KES {product.priceKes}</p>
                <p>{product.description}</p>
              </div>
            </div>
          ))}
          {featuredProducts.length === 0 && (
            <p>More products coming soon...</p>
          )}
        </div>
      </section>

      <section className="text-center">
        <h2>Need Help Ordering?</h2>
        <p className="intro-text">
          If you&apos;d like bulk orders for events, Scout groups, or partnerships, contact SER and we&apos;ll assist.
        </p>
        <Link href="/contact" className="btn btn-accent">Contact SER</Link>
      </section>
    </>
  );
}
