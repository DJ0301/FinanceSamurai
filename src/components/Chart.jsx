import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import Community from './Community';

const ApexChart = () => {
  const [series, setSeries] = useState([]);
  const [symbol, setSymbol] = useState('AAPL');
  const [interval, setInterval] = useState('1d');
  const [range, setRange] = useState('1mo');

  const stocks = [
    'AAPL', 'GOOG', 'MSFT', 'AMZN', 'TSLA', 'FB', 'V', 'JPM', 'PYPL', 'INTC',
    'BAJFINANCE.BO', 'RELIANCE.BO', 'HDFCBANK.BO', 'INFY.BO', 'TCS.BO', 'WIPRO.BO', 'CIPLA.BO', 'ICICIBANK.BO', 'ONGC.BO', 'COALINDIA.BO',
    'ICICIPRULI.NS', 'SUNPHARMA.NS', 'TATAMOTORS.NS', 'HINDUNILVR.NS', 'KOTAKBANK.NS', 'HDFCLIFE.NS', 'HCLTECH.NS', 'AXISBANK.NS', 'TITAN.NS', 'ITC.NS',
    'BAJAJFINSV.BO', 'HDFC.BO', 'LT.BO', 'MARUTI.BO', 'NESTLEIND.BO', 'TATASTEEL.BO', 'GAIL.BO', 'SBIN.BO', 'CIPLA.BO', 'TITAN.BO', 'HCLTECH.BO',
    'BAJAJFINSV.NS', 'HDFC.NS', 'LT.NS', 'MARUTI.NS', 'NESTLEIND.NS', 'TATASTEEL.NS', 'GAIL.NS', 'SBIN.NS', 'CIPLA.NS', 'TITAN.NS', 'HCLTECH.NS'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.post('http://localhost:3010/api/stockdata', { symbol, interval, range });
        const newSeries = [{
          data: data.timestamp.map((timestamp, index) => ({
            x: new Date(timestamp * 1000), // Convert timestamp to milliseconds
            y: [
              parseFloat(data.open[index]).toFixed(3),
              parseFloat(data.high[index]).toFixed(3),
              parseFloat(data.low[index]).toFixed(3),
              parseFloat(data.close[index]).toFixed(3),
            ]
          }))
        }];
        setSeries(newSeries);
      } catch (error) {
        console.error('Error fetching stock data: ', error);
      }
    };

    fetchData();
  }, [symbol, interval, range]); // Update when symbol, interval, or range changes

  const options = {
    chart: {
      type: 'candlestick',
      height: 350,
    },
    title: {
      text: 'CandleStick Chart',
      align: 'left',
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div>
      {/* <div id="chart">
        <ReactApexChart options={options} series={series} type="candlestick" height={350} />
      </div> */}
      <div id="html-dist"></div>
      <div style={{justifyContent: 'space-around', display: 'flex', marginTop: 80 }}>
      <div style={{ position: 'relative', height: 40, width: 165, display: 'flex', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}>
  <label htmlFor="symbol" style={{ margin: '0 10px', color: '#333', fontSize: 14 }}>Symbol:</label>
  <select
    id="symbol"
    value={symbol}
    onChange={(e) => setSymbol(e.target.value)}
    style={{
      flex: 1,
      height: '100%',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: 14,
      color: '#333',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3csvg fill=\'%23000000\' xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'24\' height=\'24\'%3e%3cpath d=\'M7 10l5 5 5-5z\'/%3e%3c/svg%3e")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center', // Adjusted background position
      paddingRight: 25,
      maxWidth: '100px', // Reduce the width of the dropdown
    }}
  >
    {stocks.map((stock, index) => (
      <option key={index} value={stock} style={{ backgroundColor: '#ffffff', color: '#333', padding: '8px 12px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}>{stock}</option>
    ))}
  </select>
</div>




<div style={{ position: 'relative', height: 40, width: 150, display: 'flex', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
  <label htmlFor="interval" style={{ marginRight: 10, marginLeft: 10, color: '#333', fontSize: 14 }}>Interval:</label>
  <select
    id="interval"
    value={interval}
    onChange={(e) => setInterval(e.target.value)}
    style={{
      flex: 1,
      height: '100%',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      borderRadius: 12,
      fontSize: 16,
      color: '#171717',
      appearance: 'none', 
      backgroundImage: 'url("data:image/svg+xml,%3csvg fill=\'%23000000\' xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'24\' height=\'24\'%3e%3cpath d=\'M7 10l5 5 5-5z\'/%3e%3c/svg%3e")', // Custom arrow icon
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      paddingRight: 25, 
    }}
  >
    <option value="1d">1d</option>
    <option value="1wk">1wk</option>
    <option value="1mo">1mo</option>
  </select>
</div>


<div style={{ position: 'relative', height: 40, width: 150, display: 'flex', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
  <label htmlFor="range" style={{ marginRight: 10, marginLeft: 10, color: '#333', fontSize: 14 }}>Range:</label>
  <select
    id="range"
    value={range}
    onChange={(e) => setRange(e.target.value)}
    style={{
      flex: 1,
      height: '100%',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: 16,
      borderRadius: 12,
      color: '#171717',
      appearance: 'none', // Hide the default arrow
      backgroundImage: 'url("data:image/svg+xml,%3csvg fill=\'%23000000\' xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'24\' height=\'24\'%3e%3cpath d=\'M7 10l5 5 5-5z\'/%3e%3c/svg%3e")', // Custom arrow icon
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      paddingRight: 25, // Add some space for the arrow icon
    }}
  >
    <option value="1mo">1mo</option>
    <option value="3mo">3mo</option>
    <option value="6mo">6mo</option>
  </select>
</div>



      </div>

      <div id="chart" style={{marginTop: 50}}>
        <ReactApexChart options={options} series={series} type="candlestick" height={350} />
      </div>
      
     {/* <Community/> */}
        
    </div>
  );
};

export default ApexChart;
