
if (window.CCPCommandPalette !== undefined) {

    window.ccpAPI = {};
    var methods = ['getHTML','getAnchorCompletions','clickAnchor'];
    for (var i = 0; i < methods.length; i++) {
        window.ccpAPI[methods[i]] = (function(method) {
            return function(tabId, arg, callback) {
                chrome.tabs.sendRequest(tabId, { method: method, arg: arg }, function(response) {
                    if (response === undefined) {
                        console.log(chrome.runtime.lastError);
                    } else if(response.method === method) {
                        callback(response.returnValue);
                    } else {
                        console.log('Invalid ccpAPI method response, was ' + response.method + ' but expecting ' + method);
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
                var $a = document.getElementsByTagName('a');
                $a = window.ccpUtil.filter($a, function(a){ return a.innerText !== undefined && a.innerText !== ''; });
                $a = window.ccpUtil.map($a, function(a){ return { text: a.innerText, selector:'a[href="' + a.href + '"]' } });
                return $a;
            },

            clickAnchor : function(selector) {
                console.log('clicking on ' + selector);
                return document.querySelector(selector).click();
            }

        };

        chrome.extension.onRequest.addListener(
            function(request, sender, sendResponse) {
                if(methods[request.method]) {
                    sendResponse({
                        method: request.method,
                        returnValue: methods[request.method](request.arg) });
                } else {
                    console.log('Invalid ccpAPI method request: ' + request.method);
                }
            }
        );

    })();

};