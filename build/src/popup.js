// Function to generate a random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Get the active tab's URL using chrome.tabs API
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  const currentTabUrl = tabs[0].url;  // The URL of the current active tab
  console.log('Current Tab URL:', currentTabUrl);  // Debug log
  
  // Extract the username from the URL (for Reddit user pages)
  const regex = /https:\/\/www\.reddit\.com\/user\/([^\/]+)(?:\/|$)/;
  const match = currentTabUrl.match(regex);

  // Show loading spinner while fetching data
  document.getElementById('loading-spinner').style.display = 'block';
  
  if (match && match[1]) {
    const username = match[1];
    document.getElementById('username').textContent = username;

    // Send message to background script to fetch mood score
    chrome.runtime.sendMessage(
      { action: 'fetchMoodScore', username: username },
      function(response) {
        document.getElementById('loading-spinner').style.display = 'none';  // Hide spinner once data is received
        
        if (response && response.error) {
          document.getElementById('mood-score').textContent = `Error: ${response.error}`;
          document.getElementById('mood-score').classList.add('error');
        } else if (response) {
          const moodScore = response.mood_score;
          document.getElementById('mood-score').textContent = `Mood Score: ${moodScore}`;
        } else {
          document.getElementById('mood-score').textContent = 'Error: No response from the server';
          document.getElementById('mood-score').classList.add('error');
        }

        // Fetch and display additional user details from Reddit API
        fetch(`https://www.reddit.com/user/${username}/about.json`)
          .then(res => res.json())
          .then(data => {
            const userData = data.data;
            const avatar = userData.icon_img;
            const accountAge = new Date() - new Date(userData.created_utc * 1000);
            const karma = `Post Karma: ${userData.link_karma} | Comment Karma: ${userData.comment_karma}`;
            
            // Set random color for the avatar box instead of an image
            document.getElementById('avatar').style.backgroundColor = getRandomColor();
            
            // Set account age (in years)
            const years = (accountAge / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
            document.getElementById('account-age').textContent = `Account Age: ${years} years`;

            // Set karma
            document.getElementById('karma').textContent = karma;

            // Set profile link
            const profileLink = `https://www.reddit.com/user/${username}`;
            document.getElementById('profile-link').href = profileLink;
          })
          .catch(err => {
            console.error('Error fetching user data:', err);
            document.getElementById('subreddits').textContent = 'Error fetching user details';
          });

        // Fetch recent posts to analyze mood and toxicity
        fetch(`https://www.reddit.com/user/${username}/submitted.json?limit=5`)
          .then(res => res.json())
          .then(postsData => {
            const posts = postsData.data.children;
            let moodText = '';
            let toxicityWarning = '';
            
            // Analyze recent posts
            posts.forEach(post => {
              const postTitle = post.data.title;
              const postText = post.data.selftext;

              // Example: Simplified sentiment and toxicity check
              if (postText.includes('hate') || postTitle.includes('hate')) {
                toxicityWarning = 'Warning: Potentially harmful or toxic content detected.';
              }

              // Example: Mood based on sentiment (basic check for now)
              if (postText.includes('happy') || postTitle.includes('happy')) {
                moodText = 'User appears to be in a positive mood.';
              } else if (postText.includes('sad') || postTitle.includes('sad')) {
                moodText = 'User appears to be in a negative mood.';
              }
            });

            // Update mood and toxicity insights
            document.getElementById('mood-insight').textContent = moodText || 'No clear mood detected.';
            document.getElementById('toxicity-warning').textContent = toxicityWarning || 'No toxicity detected in recent posts.';
          })
          .catch(err => {
            console.error('Error fetching posts data:', err);
            document.getElementById('mood-insight').textContent = 'Error fetching recent posts.';
          });
      }
    );
    
  } else {
    document.getElementById('username').textContent = "No username found!";
    document.getElementById('loading-spinner').style.display = 'none';  // Hide spinner if no username
  }
});
