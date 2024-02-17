import { BrowserRouter as Router, Route } from 'react-router-dom';
import Navbar from './Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Route path="/features" component={Features} />
      <Route path="/testimonials" component={Testimonials} />
      <Route path="/highlights" component={Highlights} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/faq" component={FAQ} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
    </Router>
  );
}