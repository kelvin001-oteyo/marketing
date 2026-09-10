import { Link } from "react-router-dom";

import "../styles/auth.css";


export default function Contact() {
    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="contact-title">
                <Link className="auth-brand" to="/">Oteyo<span>Market</span></Link>
                <p className="auth-eyebrow">CUSTOMER SUPPORT</p>
                <h1 id="contact-title">We are here to help</h1>
                <p className="auth-intro">
                    Need help with an order, payment, delivery, or your seller account?
                    Contact the OteyoMarket support team.
                </p>
                <div className="auth-contact-details">
                    <a href="mailto:support@oteyomarket.com">support@oteyomarket.com</a>
                    <a href="tel:+254700000000">+254 700 000 000</a>
                </div>
                <p className="auth-footer"><Link to="/">Return to shopping</Link></p>
            </section>
        </main>
    );
}
