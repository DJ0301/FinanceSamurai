import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          Finance Samurai
        </Link>
        <nav>
          <Link to="/features">Features</Link>
          <Link to="/testimonials">Testimonials</Link>
          <Link to="/highlights">Highlights</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
