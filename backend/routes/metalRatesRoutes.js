const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/metal-rates - Fetch current gold and silver rates
router.get('/', async (req, res) => {
  try {
    // Your Gold API key - replace with your actual key
    // Get your free key from https://www.goldapi.io/
    const API_KEY = 'goldapi-ipcsmlmfyvrs-io'; // Replace with valid key if you have one
    
    const headers = {
      'x-access-token': API_KEY,
      'Content-Type': 'application/json'
    };

    // Fetch Gold (XAU) and Silver (XAG) rates in parallel
    const [goldResponse, silverResponse] = await Promise.all([
      axios.get('https://www.goldapi.io/api/XAU/INR', { headers }).catch(err => null),
      axios.get('https://www.goldapi.io/api/XAG/INR', { headers }).catch(err => null)
    ]);

    // Check if API calls were successful
    if (goldResponse?.data && silverResponse?.data) {
      const goldData = goldResponse.data;
      const silverData = silverResponse.data;
      
      const gold24K = goldData.price_gram_24k || goldData.price / 31.1035;
      const gold22K = goldData.price_gram_22k || (gold24K * (22 / 24));
      const silverPrice = silverData.price_gram_24k || silverData.price / 31.1035;
      const goldChange = goldData.ch || 0;
      const silverChange = silverData.ch || 0;
      const timestamp = new Date(goldData.timestamp * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      res.json({
        success: true,
        gold24K: Math.round(gold24K),
        gold22K: Math.round(gold22K),
        silver: Math.round(silverPrice),
        trends: {
          gold: goldChange >= 0 ? 'up' : 'down',
          silver: silverChange >= 0 ? 'up' : 'down'
        },
        timestamp
      });
    } else {
      // Return fallback rates if API fails
      res.json({
        success: false,
        message: 'Using cached rates - API unavailable',
        gold24K: 7150,
        gold22K: 6554,
        silver: 89,
        trends: {
          gold: 'up',
          silver: 'up'
        },
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      });
    }
  } catch (error) {
    console.error('Error fetching metal rates:', error.message);
    
    // Return fallback rates on error
    res.json({
      success: false,
      message: 'Using cached rates - API error',
      gold24K: 7150,
      gold22K: 6554,
      silver: 89,
      trends: {
        gold: 'up',
        silver: 'up'
      },
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    });
  }
});

module.exports = router;
