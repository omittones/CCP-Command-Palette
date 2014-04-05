
if (window.CCPCommandPalette !== undefined) {

    window.ccpAPI = {};
    var methods = ['getHTML','getAnchorCompletions','selectAndClick'];
    for (var i = 0; i < methods.length; i++) {
        window.ccpAPI[methods[i]] = (function(method) {
            return function(arg, callback) {
                chrome.windows.getCurrent({populate: true}, function(window) {
                    for (var i = window.tabs.length - 1; i >= 0; i--) {
                        if (window.tabs[i].active) {
                            log.debug('Calling ccpAPI.' + method + ' for tab ' + window.tabs[i].id.toString());
                            chrome.tabs.sendRequest(window.tabs[i].id, { method: method, arg: arg }, function(response) {
                                if (response === undefined) {
                                    log.error(chrome.runtime.lastError);
                                } else if (response.method === method) {
                                    if (callback)
                                        callback(response.returnValue);
                                } else {
                                    log.error('Invalid ccpAPI method response, was ' + response.method + ' but expecting ' + method);
                                }
                            });
                            return;
                        }
                    }
                });
            };
        })(methods[i]);
    }
}
else
{
    (function() {

        var methods = {

            getHTML : function(arg){
                return 'OK!!!!';
            },

            getAnchorCompletions : function(arg) {

                var anchorNodes = document.querySelectorAll('a');
                console.debug('Found ' + anchorNodes.length + ' total anchors...');

                anchorNodes = window.ccpUtil.filter(anchorNodes, function(anchorNode){ return anchorNode.innerText !== undefined && anchorNode.innerText !== ''; });
                anchorNodes = window.ccpUtil.map(anchorNodes, function(anchorNode) {
                    var selector;
                    if (anchorNode.id)
                        selector = '#' + anchorNode.id;
                    else if (anchorNode.attributes && anchorNode.attributes['href'])
                        selector = 'a[href="' + anchorNode.attributes['href'].value + '"]';
                    else
                        return null;

                    return { 'text': anchorNode.innerText, 'selector':selector };
                });

                anchorNodes = window.ccpUtil.filter(anchorNodes, function(obj) { return obj !== null; });
                console.debug('Found ' + anchorNodes.length + ' valid anchors...');

                return anchorNodes;
            },

            selectAndClick : function(selector) {
                console.debug('clicking on ' + selector);
                return document.querySelector(selector).click();
            }

        };

        chrome.extension.onRequest.addListener(
            function(request, sender, sendResponse) {
                console.debug('Received ccpAPI.' + request.method + ' request');
                if(methods[request.method]) {
                    sendResponse({
                        method: request.method,
                        returnValue: methods[request.method](request.arg) });
                } else {
                    console.error('Could not find method: ' + request.method);
                }
            }
        );

    })();

};