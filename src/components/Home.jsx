import React from 'react';
import './Home.css';
const Home = () => {
  return (
    <div name='home' className='w-full h-screen bg-[#0a192f]'>
      {/* Container */}
      <div className='max-w-[1000px] mx-auto px-8 flex flex-col justify-center h-full'>
        <p className='text-pink-600'>Hi, we are </p>
        <div className='flipUp-360'>
        <h1 className='text-4xl sm:text-7xl font-bold text-[#ccd6f6]'>
        FINANCE +
        </h1>
        </div>
        <h2 className='text-4xl sm:text-7xl font-bold text-[#8892b0]'>
          Your investment buddies.
        </h2>
        <p className='text-[#8892b0] py-4 max-w-[700px]'>
        With Finance+ , you can easily enhance your portfolio, view stock market data and cryptocurrencies, and get the latest news on the stock market.
        </p>
      </div>
    </div>
  );
};

export default Home;
