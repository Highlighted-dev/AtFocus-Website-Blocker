function urlFormater(url) {
  if (url.startsWith('http://')) url = url.replace('http://', '');
  else if (url.startsWith('https://')) url = url.replace('https://', '');
  // slice everything after .com, .org, etc. Excalibur.com/abc -> Excalibur.com
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (url.includes('.') && url.includes('/')) {
    url =
      url.slice(0, url.indexOf('.')) +
      url.slice(url.indexOf('.'), url.indexOf('/'));
  }
  return url;
}

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get('blockedWebsites', function (data) {
    var blockedWebsites = data.blockedWebsites || [];
    document.getElementById('blocked-list').innerHTML =
      blockedWebsites.join(', ');
  });
  document
    .getElementById('add-blocked-url')
    .addEventListener('click', function () {
      var url = document.getElementById('blocked-url').value;
      const checkIfUrlIsntValid = new RegExp(
        '^(https?://)?(www\\.)?[a-z0-9-]+(\\.[a-z0-9-]+)+([/?#][^\\s]*)?$',
        'i'
      );
      if (!url || url == '' || !checkIfUrlIsntValid.test(url))
        return alert('Please enter a valid URL!');
      url = urlFormater(url);
      chrome.storage.sync.get('blockedWebsites', function (data) {
        var blockedWebsites = data.blockedWebsites || [];
        if (blockedWebsites.indexOf(url) !== -1)
          return alert('Website already blocked!');
        blockedWebsites.push(url);
        chrome.storage.sync.set(
          { blockedWebsites: blockedWebsites },
          function () {
            alert('Website blocked successfully!');
          }
        );
      });
    });

  document
    .getElementById('remove-blocked-url')
    .addEventListener('click', function () {
      var url = document.getElementById('blocked-url').value;
      if (!url || url == '') return alert('Please enter a valid URL!');
      url = urlFormater(url);
      chrome.storage.sync.get('blockedWebsites', function (data) {
        var blockedWebsites = data.blockedWebsites || [];
        if (blockedWebsites.indexOf(url) === -1)
          return alert('Website is not blocked!');
        blockedWebsites.splice(blockedWebsites.indexOf(url), 1);
        chrome.storage.sync.set(
          { blockedWebsites: blockedWebsites },
          function () {
            alert('Website unblocked successfully!');
          }
        );
      });
    });
});

chrome.storage.onChanged.addListener(function (changes) {
  blocked_websites = changes.blockedWebsites.newValue;
  document.getElementById('blocked-list').innerHTML =
    blocked_websites.join(', ');
});
