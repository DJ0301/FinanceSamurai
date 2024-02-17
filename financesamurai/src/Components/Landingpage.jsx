import React from 'react';

function LandingPage() {
  return (
    <div className="background">
      <div className="content">
        <h1>Look first / Then leap</h1>
        <p>The best trades require research, then commitment</p>
        <form>
          <input type="text" id="search" placeholder="Search markets here">
          <button type="submit">Q</button>
        </form>
        <div className="market-data">
          <div>
            <h2>BTCUSD</h2>
            <p>51 936.00 USD</p>
            <p>50</p>
          </div>
          <div>
            <h2>NIFTY</h2>
            <p>22 040.70 INR</p>
          </div>
          <div>
            <h2>BANKNIFTY</h2>
            <p>46 384.85 INR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;