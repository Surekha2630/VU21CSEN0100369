const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

let windowCurrState = [];
let windowPrevState = [];

// Bearer Token (replace with the actual token received from your previous request)
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0NzM4Mzg2LCJpYXQiOjE3MjQ3MzgwODYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjY3YTQ2YjhlLWEwODMtNGM4ZC05MTE4LTNjYTA5NjhmYWQwNSIsInN1YiI6InNuYXJhdmFAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoic3VyZWtoYU1hcnQiLCJjbGllbnRJRCI6IjY3YTQ2YjhlLWEwODMtNGM4ZC05MTE4LTNjYTA5NjhmYWQwNSIsImNsaWVudFNlY3JldCI6ImRlWllXcG9oUlpYSGtKYkkiLCJvd25lck5hbWUiOiJTdXJla2hhIiwib3duZXJFbWFpbCI6InNuYXJhdmFAZ21haWwuY29tIiwicm9sbE5vIjoiVlUyMUNTRU4wMTAwMzY5In0.kmZD-LYYjdyjprmtyTJ04q11y3jTecQV_1h5o2rFypU';

// Function to fetch numbers from the test server based on type
const fetchNumbers = async (type) => {
  const urlMap = {
    'p': 'http://20.244.56.144/test/primes',
    'f': 'http://20.244.56.144/test/fibo',
    'e': 'http://20.244.56.144/test/even',
    'r': 'http://20.244.56.144/test/random',
  };

  try {
    const response = await axios.get(urlMap[type], {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });
    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return [];
  }
};

// Function to calculate the average of an array
const calculateAverage = (numbers) => {
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return numbers.length > 0 ? (sum / numbers.length).toFixed(2) : 0;
};

// API Route to handle requests
app.get('/numbers/:type', async (req, res) => {
  const { type } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(type)) {
    return res.status(400).json({ error: 'Invalid number type.' });
  }

  // Fetch new numbers
  const newNumbers = await fetchNumbers(type);

  // Update the states
  windowPrevState = [...windowCurrState];
  windowCurrState = [...windowCurrState, ...newNumbers]
    .filter((num, index, self) => self.indexOf(num) === index) // Remove duplicates
    .slice(-WINDOW_SIZE); // Maintain window size

  // Calculate the average
  const average = calculateAverage(windowCurrState);

  // Response format
  res.json({
    windowPrevState,
    windowCurrState,
    numbers: newNumbers,
    avg: average,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
