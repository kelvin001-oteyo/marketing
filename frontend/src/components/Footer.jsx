import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="marketplace-footer">
            <div className="marketplace-footer-inner">

                <div className="footer-col footer-brand-col">
                    <Link to="/" className="marketplace-logo">
                        Oteyo<span>Market</span>
                    </Link>
                    <p>
                        Your marketplace for quality products
                        from trusted sellers across Kenya.
                    </p>
                </div>

                <div className="footer-col">
                    <h4>Shop</h4>
                    <Link to="/products">Products</Link>
                    <Link to="/categories">Categories</Link>
                    <Link to="/stores">Stores</Link>
                </div>

                <div className="footer-col">
                    <h4>Account</h4>
                    <Link to="/profile">My Account</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/wishlist">Wishlist</Link>
                </div>

                <div className="footer-col">
                    <h4>Contact</h4>
                    <span className="footer-contact-name">NILA FASHION</span>
                    <a href="tel:+254790171964">+254 790 171964</a>
                    <a href="mailto:musimbilinda1992@gmail.com">
                        musimbilinda1992@gmail.com
                    </a>
                </div>

            </div>

            <div className="marketplace-footer-bottom">
                <p>
                    &copy; {new Date().getFullYear()} OteyoMarket.
                    All rights reserved.
                </p>
            </div>
        </footer>
    );
}
