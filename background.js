// Get the current blockedWebsites from storage
const getStorageData = key => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, result => {
      if (chrome.runtime.lastError) {
        reject(Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
};

let blocked_websites = [];

// initial event listener with the current blockedWebsites
getStorageData('blockedWebsites').then(function (data) {
  blocked_websites = data.blockedWebsites || [];
  chrome.webRequest.onBeforeRequest.addListener(
    blockRequests,
    { urls: ['<all_urls>'] },
    ['blocking']
  );
});

function blockRequests(details) {
  if (!details.url) return;
  var url = new URL(details.url);
  var isBlocked = blocked_websites.some(function (domain) {
    return url.hostname === domain || url.hostname.endsWith(domain);
  });
  if (isBlocked) return { cancel: true };
}

// event listener for changes in the blockedWebsites array
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.blockedWebsites) {
    const { newValue, oldValue } = changes.blockedWebsites;
    const newBlockedWebsites = newValue || [];
    chrome.webRequest.onBeforeRequest.removeListener(blockRequests);
    // do something with the updated blockedWebsites array
    blocked_websites = newBlockedWebsites;
    chrome.webRequest.onBeforeRequest.addListener(
      blockRequests,
      { urls: ['<all_urls>'] },
      ['blocking']
    );
  }
});
