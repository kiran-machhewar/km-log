var sessionId = document.cookie.match(/(^|;\s*)sid=(.+?);/)[2];
console.log('Session Id is-->'+sessionId);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
        
        if(request.action == 'getSessionId'){
            let domain = window.location.href.split('.com')[0]+'.com';
            sendResponse({
                'sessionId':sessionId,
                'domain':domain
            },true);
        }
        if(request.action == 'OPEN_LINK'){
            window.open(request.url,'_blank');
        }
    }
);