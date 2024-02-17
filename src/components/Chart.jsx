import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

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
      <div>
        <label htmlFor="symbol">Symbol:</label>
        <select id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {stocks.map((stock, index) => (
            <option key={index} value={stock}>{stock}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="interval">Interval:</label>
        <select id="interval" value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option value="1d">1d</option>
          <option value="1wk">1wk</option>
          <option value="1mo">1mo</option>
        </select>
      </div>
      <div>
        <label htmlFor="range">Range:</label>
        <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="1mo">1mo</option>
          <option value="3mo">3mo</option>
          <option value="6mo">6mo</option>
        </select>
      </div>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="candlestick" height={350} />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default ApexChart;
