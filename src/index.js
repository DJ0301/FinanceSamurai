import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import BrowserRouter, Routes, and Route
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Navbar from './components/Navbar';
import ApexChart from './components/Chart';
import Community from './components/Community';
ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-vgdwcqt11qrihuga.us.auth0.com"
      clientId="SlFcLOHmgm7EBJjUdYUKAhwxFQ4cVtxQ"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <Router>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/home' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/community' element={<Community />} />
        </Routes>
      </Router>
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
