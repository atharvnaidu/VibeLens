// content.js

console.log(chrome);  // Log chrome object to check if it's available

// Extract the current URL of the Reddit user page
const currentUrl = window.location.href;

// Store the URL using chrome.storage.local
chrome.storage.local.set({ redditUrl: currentUrl }, function() {
  console.log('Reddit user URL saved:', currentUrl);
});
