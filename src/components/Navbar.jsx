import React, { useState } from 'react';
import './CandidateSearch.css';
import Logo from '../assets/Logo.png';
import { NavLink } from 'react-router-dom'; // Import NavLink from react-router-dom
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0();

  return (
    <div className='fixed w-full h-[200px] flex justify-between items-center px-4 bg-[#0a192f] text-gray-300'>
      <div>
        <a className="navbar-brand" href="#">
          <img src={Logo} alt='Logo Image' style={{ height: '130px'}} />
        </a>
      </div>

      {/* menu */}
      <ul className='hidden md:flex'>
        <li>
          <NavLink to='/home' activeClassName='active' smooth={true} duration={500}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to='/about' activeClassName='active' smooth={true} duration={500}>
            Community
          </NavLink>
        </li>
        <li>
          <NavLink to='/work' activeClassName='active' smooth={true} duration={500}>
            Stock Markets
          </NavLink>
        </li>
        <li>
          <NavLink to='/CandidateList' activeClassName='active' smooth={true} duration={500}>
            Cryptocurrencies
          </NavLink>
        </li>
        <li>
          <NavLink to='/chart' activeClassName='active' smooth={true} duration={500}>
            View Charts
          </NavLink>
        </li>
        {isAuthenticated && (
          <li>
            <p> ${user.name}'s portfolio </p>
          </li>
        )}
        {isAuthenticated ? (
          <li>
            <button onClick={() => logout({ returnTo: window.location.origin })}>
              Log Out
            </button>
          </li>
        ) : (
          <li>
            <button onClick={() => loginWithRedirect()}>Log In</button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
