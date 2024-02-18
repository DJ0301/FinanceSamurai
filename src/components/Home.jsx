import React from 'react';
import './Home.css';
import Navbar from "./Navbar.jsx";
import backgroundImage from '../assets/homebg.png'; // Import your background image

const Home = () => {
  
  return (
    <div>
      <Navbar />
      <div name='home' className='w-full h-screen bg-[#000000]' style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>
        {/* Container */}
        <div className='max-w-[1000px] mx-auto px-8 flex flex-col justify-center h-full'>
          <div className='flipUp-360'>
            <h1></h1><h1 className='text-4xl sm:text-7xl font-bold text-[#4f02fd]'>
              WELCOME TO FINANCE +
            </h1>
          </div>
          <h2 className='text-4xl sm:text-7xl font-bold text-[#348bcb]'>
            Your investment buddies.
          </h2>
          <p className='text-[#8892b0] py-4 max-w-[700px]'>
            With Finance+, you can easily enhance your portfolio, view stock market data and cryptocurrencies, and get the latest news on the stock market.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
