const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/find', async (req, res) => {
  try {
    // ThingSpeak API URL
    const url = 'https://api.thingspeak.com/channels/3124813/feeds.json?api_key=0K9HXMSZY9DOHBBF';

    // Call API using axios
    const response = await axios.get(url);

    // Send data back to client
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching ThingSpeak data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
