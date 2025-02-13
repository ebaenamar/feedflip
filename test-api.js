const { google } = require('googleapis');

const youtube = google.youtube('v3');

async function testYouTubeAPI() {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      maxResults: 1,
      q: 'test',
      type: ['video'],
      videoDuration: 'short',
      key: '***REMOVED***',
    });

    console.log('API call successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing YouTube API:');
    console.error(error.message);
  }
}

testYouTubeAPI();
