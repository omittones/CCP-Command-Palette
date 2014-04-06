var CCP = CCP || {};

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {

        console.debug('Received client request for ' + request.command + '.' + request.method);
        if(CCP.Commands[request.command] && CCP.Commands[request.command][request.method]) {
            sendResponse({
                command: request.command,
                method: request.method,
                returnValue: CCP.Commands[request.command][request.method](request.arg) });
        } else {
            console.error('Could not find ' + request.command + '.' + request.method);
        }

    }
);
