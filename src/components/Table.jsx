import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { PieChart } from '@mui/x-charts/PieChart';
import StockDataComponent from './apidata';

StockDataComponent('AAPL', '1d', '3mo');

const calculateWeight = (assetValue, totalPortfolioValue) => {
  return (assetValue / totalPortfolioValue) * 100;
};

function createData(name, original, currentvalue, totalPortfolioValue) {
  const originalValue = parseFloat(original.replace('$', ''));
  const currentValue = parseFloat(currentvalue.replace('$', ''));
  const currentReturnPercent = ((currentValue - originalValue) / originalValue) * 100;
  const profitloss = currentValue - originalValue;
  const weight = calculateWeight(currentValue, totalPortfolioValue);
  return { name, original, currentReturnPercent, currentvalue, profitloss, weight };
}

const rowsData = [
  { name: 'Asset 1', original: '$1000', currentvalue: '$1100' },
  { name: 'Asset 2', original: '$1500', currentvalue: '$1575' },
  { name: 'Asset 3', original: '$800', currentvalue: '$920' },
  { name: 'Asset 4', original: '$2000', currentvalue: '$2160' },
  { name: 'Asset 5', original: '$1200', currentvalue: '$1344' },
];

const totalPortfolioValue = rowsData.reduce((total, row) => total + parseFloat(row.currentvalue.replace('$', '')), 0);

const rows = rowsData.map(row => createData(row.name, row.original, row.currentvalue, totalPortfolioValue));

export default function BasicTable() {
  const pieChartData = rows.map((row, index) => ({
    id: index,
    value: row.weight,
    label: row.name,
  }));

  return (
    <div>
      <PieChart
        series={[{ data: pieChartData }]}
        width={400}
        height={200}
      />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Asset </TableCell>
              <TableCell align="right">Orignal Investment</TableCell>
              <TableCell align="right">Return&nbsp;%</TableCell>
              <TableCell align="right">Current Value</TableCell>
              <TableCell align="right">Profit/Loss</TableCell>
              <TableCell align="right">Weight of Asset</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">{row.name}</TableCell>
                <TableCell align="right">{row.original}</TableCell>
                <TableCell align="right">{row.currentReturnPercent.toFixed(2)}%</TableCell>
                <TableCell align="right">{row.currentvalue}</TableCell>
                <TableCell align="right">{row.profitloss}</TableCell>
                <TableCell align="right">{row.weight.toFixed(3)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}



