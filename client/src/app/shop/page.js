import Link from 'next/link';
import { getProducts } from '../admin/actions';

export const metadata = {
  title: 'Official Shop & Gear | Scouts Emergency Response',
  description: 'Support Scouts Emergency Response (SER) by purchasing official merchandise, emergency kits, badges, and safety gear.',
  openGraph: {
    title: 'Official Shop & Gear | Scouts Emergency Response',
    description: 'Support Scouts Emergency Response (SER) by purchasing official merchandise, emergency kits, badges, and safety gear.',
    url: '/shop',
  },
  alternates: {
    canonical: '/shop',
  },
};

export default async function Shop() {
  const products = await getProducts();
  const featuredProducts = products.filter(p => p.featured);

  return (
    <>
      <section className="shop-hero page-hero">
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
