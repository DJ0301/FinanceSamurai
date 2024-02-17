import axios from 'axios';

export default async function StockDataComponent(symbol, interval, range) {
  try {
    const response = await axios.post('http://localhost:3010/api/stockdata', { symbol, interval, range });
    console.log(response.data.open,response.data.high,response.data.low,response.data.close,response.data.volume,response.data.timestamp);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}