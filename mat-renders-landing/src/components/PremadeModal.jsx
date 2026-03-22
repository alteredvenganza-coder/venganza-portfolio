import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, ExternalLink, MessageCircle } from 'lucide-react';
import { STRIPE_PAYMENT_LINK, INSTAGRAM_DM_URL } from '../config';

export default function PremadeModal({ premade, onClose }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      gsap.from(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.from(contentRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.4,
        delay: 0.1,
        ease: 'power3.out',
      });
    });

    return () => {
      document.body.style.overflow = '';
      ctx.revert();
    };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const stripeUrl = `${STRIPE_PAYMENT_LINK}?client_reference_id=premade-${premade.number}`;
  const dmUrl = `${INSTAGRAM_DM_URL}`;
  const dmMessage = `Hi! I'd like to purchase Premade #${premade.number}`;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm"
    >
      <div
        ref={contentRef}
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-charcoal/10 flex items-center justify-center text-charcoal/60 hover:text-charcoal hover:bg-white transition-all"
        >
          <X size={18} />
        </button>

        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-t-3xl bg-neutral-100">
          <img
            src={premade.imageUrl}
            alt={`Premade #${premade.number}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-mono text-sm tracking-widest uppercase text-charcoal/50">
              Premade #{premade.number}
            </h2>
            <span className="font-sans text-2xl font-bold text-charcoal">
              ${premade.price}
            </span>
          </div>

          <p className="font-mono text-xs text-charcoal/40 mb-6 leading-relaxed">
            Complete your payment via Stripe, then send us a DM on Instagram
            with your premade number to confirm your order.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <a
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic-btn flex items-center justify-center gap-2 bg-charcoal text-cream px-6 py-4 text-sm font-semibold rounded-xlarge shadow-lg hover:shadow-xl transition-shadow"
            >
              <ExternalLink size={16} />
              <span>Pay with Stripe — ${premade.price}</span>
            </a>

            <a
              href={dmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic-btn flex items-center justify-center gap-2 bg-white text-charcoal px-6 py-4 text-sm font-semibold rounded-xlarge border border-charcoal/10 hover:border-charcoal/20 hover:shadow-md transition-all"
            >
              <MessageCircle size={16} />
              <span>Confirm via Instagram DM</span>
            </a>
          </div>

          <p className="mt-4 text-center font-mono text-[10px] text-charcoal/30 uppercase tracking-wider">
            Message: "{dmMessage}"
          </p>
        </div>
      </div>
    </div>
  );
}
