chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request.method === 'getHTML') {
            sendResponse({ method:'getHTML', html: document.all[0].outerHTML });
        }
    }
);