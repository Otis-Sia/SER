import Link from 'next/link';

export const metadata = {
  title: 'FAQs | Scouts Emergency Response',
};

export default function FAQ() {
  return (
    <>
      <section className="faq-intro page-hero text-center">
        <h1>Frequently Asked Questions (FAQs)</h1>
        <p className="intro-text">
          Here are some common questions about Scouts Emergency Response (SER). If you don&apos;t find what you&apos;re looking for, reach out and we&apos;ll help.
        </p>
        <div className="mt-1">
          <Link href="/contact" className="btn btn-accent">Contact SER</Link>
        </div>
      </section>

      <section className="faq-content intro-text">
        <div className="faq-item">
          <h2>What is Scouts Emergency Response (SER)?</h2>
          <p>
            Scouts Emergency Response (SER) is an initiative that equips Scouts and community members with emergency preparedness and response skills, including first aid and disaster readiness.
          </p>
        </div>

        <div className="faq-item">
          <h2>How can I join SER?</h2>
          <p>
            You can join by registering through our website or contacting your local Scout group. If you&apos;re not a Scout, you can still participate as a volunteer or partner.
          </p>
          <p className="mt-0_5"></p>
        </div>

        <div className="faq-item">
          <h2>What training do members receive?</h2>
          <p>
            Members receive training in first aid, emergency preparedness, disaster response, and community safety. Training may include simulations, drills, and practical sessions depending on the event.
          </p>
        </div>

        <div className="faq-item">
          <h2>Are there age restrictions to join?</h2>
          <p>
            No. SER welcomes people of all ages who want to contribute to safer communities. Some activities may be organized by age group for training purposes.
          </p>
        </div>
      </section>

      <section className="faq-cta text-center">
        <h2>Still Have Questions?</h2>
        <p className="intro-text">
          If you want to volunteer, request training, or partner with SER, contact us and we&apos;ll respond.
        </p>

        <div className="cta-actions">
          <Link href="/contact" className="btn btn-accent">Contact Us</Link>
          <Link href="/events" className="btn">View Events</Link>
        </div>
      </section>
    </>
  );
}
