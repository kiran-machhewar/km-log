chrome.runtime.onInstalled.addListener(function() {
    debugger;
    chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'sflab-dev-ed.my.salesforce.com'},
            })
            ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.browserAction.onClicked.addListener(function() {   
    debugger;
    chrome.tabs.executeScript({file: "content-script.js"}, function() {
        console.log("content loaded");
    });
});