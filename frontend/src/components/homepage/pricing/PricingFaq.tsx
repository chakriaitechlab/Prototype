import { PRICING_FAQ } from '@/utils/diamonds';

export function PricingFaq() {
  return (
    <section className="jp-section" id="faq">
      <div className="jp-container">
        <h2 className="jp-section-title jp-section-title--center">Pricing FAQs</h2>
        <div className="jp-faq">
          {PRICING_FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <div className="jp-faq-body">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
