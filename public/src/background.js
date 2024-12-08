chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchMoodScore') {
    fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: request.username })
    })
    .then(response => {
      if (!response.ok) {
        // Handle 404, 500 errors gracefully
        console.error(`Server error: ${response.status}`);
        return response.text().then(text => {
          console.error(`Response Text: ${text}`);
          return { error: `Server responded with status: ${response.status}` };
        });
      }
      // Safely attempt to parse JSON, catch errors
      return response.json().catch(err => {
        console.error('Error parsing JSON:', err);
        return { error: 'Failed to parse server response as JSON' };
      });
    })
    .then(data => sendResponse(data))
    .catch(error => {
      console.error('Fetch failed:', error);
      sendResponse({ error: 'Network request failed' });
    });

    // Must return true for async response
    return true;
  }
});
