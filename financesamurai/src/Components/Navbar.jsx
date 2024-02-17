import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/features">Features</Link>
        </li>
        <li>
          <Link to="/testimonials">Testimonials</Link>
        </li>
        <li>
          <Link to="/highlights">Highlights</Link>
        </li>
        <li>
          <Link to="/pricing">Pricing</Link>
        </li>
        <li>
          <Link to="/faq">FAQ</Link>
        </li>
        <li>
          <Link to="/signin">Sign in</Link>
        </li>
        <li>
          <Link to="/signup">Sign up</Link>
        </li>
      </ul>
    </nav>
  );
}