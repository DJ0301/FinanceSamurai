import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import './Community.css';
import { NewsComponent } from './apidata';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export const ApexChart = () => {
  const [series, setSeries] = useState([]);
  const [symbol, setSymbol] = useState('AAPL');
  const [interval, setInterval] = useState('1d');
  const [range, setRange] = useState('1mo');
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);

  const [images, setImages] = useState([]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

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
  }, [symbol, interval, range]);

  useEffect(() => {
    const fetchImgData = async () => {
      try {
        const { data } = await axios.post('http://localhost:3010/api/news', { symbol });
        setImages(data.map(item => ({
          title: item.Title,
          URL: item.Url,
          image: 'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60'
        })));
      } catch (error) {
        console.error('Error fetching stock data: ', error);
      }
    };

    fetchImgData();
  }, [symbol]);

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
      <div id="chart">
        <ReactApexChart options={options} series={series} type="candlestick" height={350} />
      </div>
      <div id="html-dist"></div>
      <div>
        <h1 style={{fontSize: 50, marginTop: 80, color: '#494949'}}>Relevant News</h1>
        <Box sx={{ width: '80%', padding: '5%', margin: 'auto' }}>
          <Paper
            square
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: 80,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              color: '#fff',
              pl: 2,
              bgcolor: '#0c0c0c',
            }}
          >
            <Typography style={{color: 'dodgerblue', fontSize: 25}}>{images[activeStep]?.title}</Typography>
          </Paper>
          <AutoPlaySwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
          >
            {images.map((step, index) => (
              <div key={step.title}>
                {Math.abs(activeStep - index) <= 2 ? (
                  <Box
                    component="img"
                    sx={{
                      height: 500,
                      fontSize: 40,
                      display: 'block',
                      overflow: 'hidden',
                      width: '100%',
                    }}
                    src={step.image}
                    alt={step.URL}
                  />
                ) : null}
              </div>
            ))}
          </AutoPlaySwipeableViews>
          <MobileStepper style={{backgroundColor: '#011222', borderBottomLeftRadius: 10, borderBottomRightRadius: 10}}
            steps={images.length}
            position="static"
            activeStep={activeStep}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === images.length - 1}
              >
                Next
                {theme.direction === 'rtl' ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            }
            backButton={
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                {theme.direction === 'rtl' ? (
                  <KeyboardArrowRight />
                ) : (
                  <KeyboardArrowLeft />
                )}
                Back
              </Button>
            }
          />
        </Box>
      </div>
    </div>
  );
};
