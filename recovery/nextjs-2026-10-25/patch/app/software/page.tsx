import Link from "next/link";

const products = [
  {
    id: "01", name: "MAT TRY-ON", type: "SHOPIFY / AI COMMERCE",
    description: "A virtual try-on experience for fashion stores. Visitors can see a product on themselves from a photo, directly within the shopping journey.",
    detail: "VIRTUAL FITTING / MERCHANT TOOLS", href: null,
    status: "PUBLIC LANDING TO BE CONFIRMED", visual: "tryon",
  },
  {
    id: "02", name: "DROP ENGINE", type: "SHOPIFY / COMMERCE SYSTEM",
    description: "A drop system built around demand and time. First come, first served: earlier buyers unlock better prices, with live drop mechanics and controlled queues.",
    detail: "DYNAMIC DROPS / BUY EARLY, PAY LESS", href: null,
    status: "PUBLIC LANDING TO BE CONFIRMED", visual: "drop",
  },
  {
    id: "03", name: "MAT RENDERS", type: "AI / CREATIVE PRODUCTION",
    description: "A creative production environment for fashion brands. Generate and explore e-commerce imagery, campaign concepts, flat lays, graphics and visual directions before production.",
    detail: "DESIGN / VISUALIZE / ITERATE", href: "https://www.mat-renders.com/",
    status: "VISIT WEBSITE", visual: "renders",
  },
] as const;

export default function SoftwarePage() {
  return (
    <section className="av-software-page" aria-labelledby="software-title">
      <div className="av-software-page__meta">
        <span>ALTERED VENGANZA / INDEX 04</span>
        <span>DIGITAL PRODUCTS AND EXPERIMENTS</span>
      </div>
      <h1 id="software-title">SOFT<br />WARE<span>.</span></h1>
      <div className="av-software-page__intro">
        <p>Tools from inside the studio.</p>
        <p>Small systems built to make fashion, creative production and online commerce work differently.</p>
      </div>
      <div className="av-software-grid">
        {products.map((product) => (
          <article className="av-software-card" key={product.id}>
            <div className={`av-software-card__visual av-software-card__visual--${product.visual}`}>
              <span>AV / PRODUCT {product.id}</span>
              <strong>{product.name}</strong>
              <span>{product.detail}</span>
            </div>
            <div className="av-software-card__info">
              <div className="av-software-card__eyebrow"><span>{product.type}</span><span>{product.id} / 03</span></div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              {product.href ? (
                <a className="av-software-card__link" href={product.href} target="_blank" rel="noreferrer">
                  {product.status} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <div className="av-software-card__pending" aria-label={product.status}>
                  {product.status} <span aria-hidden="true">↗</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      <div className="av-software-page__back"><Link href="/">← BACK TO HELLO</Link></div>
    </section>
  );
}
