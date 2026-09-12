import { Link } from "react-router-dom";
import "../styles/auth.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconMail = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
    </svg>
);

const IconPhone = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const IconTruck = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
    </svg>
);

const IconTag = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <path d="M7 7h.01" />
    </svg>
);

/* =========================================================
   CONTACT
========================================================= */

export default function Contact() {
    return (
        <main className="auth-page nf-auth-page">
            <section className="auth-card nf-auth-card" aria-labelledby="contact-title">

                {/* ---------- Left: content ---------- */}
                <div className="nf-auth-form-col nf-contact-col">

                    <Link className="auth-brand" to="/" aria-label="Nila Fashion home">
                        <span className="nf-auth-logo-mark">NF</span>
                        <span>Nila<strong>Fashion</strong></span>
                    </Link>

                    <p className="auth-eyebrow">CUSTOMER SUPPORT</p>
                    <h1 id="contact-title">We're here to help</h1>
                    <p className="auth-intro">
                        Need help with an order, payment, delivery, or your
                        seller account? Reach the Nila Fashion support team
                        and we'll get back to you as soon as possible.
                    </p>

                    <div className="nf-contact-options">
                        <a
                            href="mailto:support@nilafashion.com"
                            className="nf-contact-card"
                        >
                            <span className="nf-contact-icon" aria-hidden="true">
                                <IconMail />
                            </span>
                            <div>
                                <strong>Email support</strong>
                                <span>support@nilafashion.com</span>
                                <small>Typically replies within 24 hours</small>
                            </div>
                        </a>

                        <a
                            href="tel:+254700000000"
                            className="nf-contact-card"
                        >
                            <span className="nf-contact-icon" aria-hidden="true">
                                <IconPhone />
                            </span>
                            <div>
                                <strong>Call us</strong>
                                <span>+254 700 000 000</span>
                                <small>Mon – Sat, 9am – 6pm EAT</small>
                            </div>
                        </a>
                    </div>

                    <p className="auth-footer">
                        <Link to="/">Return to shopping</Link>
                    </p>

                    <div className="nf-auth-trust">
                        <span><IconShield /> Secure</span>
                        <span><IconTruck /> Fast delivery</span>
                        <span><IconTag /> Best prices</span>
                    </div>
                </div>

                {/* ---------- Right: aside ---------- */}
                <aside className="nf-auth-aside nf-contact-aside" aria-hidden="true">
                    <div className="nf-auth-aside-bg" />
                    <div className="nf-auth-aside-overlay" />

                    <div className="nf-auth-aside-content">
                        <span className="section-eyebrow">WE'RE LISTENING</span>
                        <h2>
                            Every order.
                            <br />
                            Every question.
                        </h2>
                        <p>
                            From product questions to delivery updates —
                            we're a message away.
                        </p>

                        <ul className="nf-auth-aside-list">
                            <li><span>✓</span> Order &amp; delivery support</li>
                            <li><span>✓</span> Payment and M-Pesa help</li>
                            <li><span>✓</span> Seller account guidance</li>
                            <li><span>✓</span> Returns &amp; refunds</li>
                        </ul>
                    </div>
                </aside>

            </section>
        </main>
    );
}
