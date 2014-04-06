var CCP = CCP || {};

(function (CCP) {

    function callOnClient(command, method, arg, onFinishedCallback) {

        chrome.windows.getCurrent({populate: true}, function(window) {
            for (var i = window.tabs.length - 1; i >= 0; i--) {
                if (window.tabs[i].active) {
                    var tabId = window.tabs[i].id;

                    log.debug('Calling ' + command + '.' + method + ' for tab ' + tabId.toString());
                    chrome.tabs.sendRequest(tabId, { command: command, method: method, arg: arg }, function(response) {
                        if (response === undefined) {
                            log.error(chrome.runtime.lastError);
                        } else if (response.command === command && response.method === method) {
                            if (onFinishedCallback)
                                onFinishedCallback(response.returnValue);
                        } else {
                            log.error('Invalid response, was ' + response.command + '.' + response.method + ' but expecting ' + command + '.' + method);
                        }
                    });

                    return;
                }
            }
        });

    }

    function handleCommandReturn(returnValue) {

        if (returnValue.closeContext)
            window.close();

    }

    CCP.Engine = {

        GetAllCommands : function(callback) {

            var commandNames = [];
            for (var command in CCP.Commands) {
                commandNames.push(command);
            }

            var allCommands = [];

            function loadCommandVariants(index) {

                if (index >= commandNames.length) {

                    if (callback)
                        callback(allCommands);

                } else {

                    var command = CCP.Commands[commandNames[index]];

                    if (command.shouldInitiateOnClient()) {
                        callOnClient(commandNames[index], 'getVariants', null, function(returnValue) {

                            var mapped = CCP.Utils.map(returnValue, function(obj){ obj.command = commandNames[index]; return obj; });
                            CCP.Utils.each(mapped, function(obj) { allCommands.push(obj); });
                            loadCommandVariants(index + 1);

                        });

                    } else {

                        var returnValue = command.getVariants();
                        var mapped = CCP.Utils.map(returnValue, function(obj){ obj.command = commandNames[index]; return obj; });
                        CCP.Utils.each(mapped, function(obj) { allCommands.push(obj); });
                        loadCommandVariants(index + 1);
                    }
                }
            }

            loadCommandVariants(0);
        },

        ExecuteCommand :  function (obj) {

            if (obj.shouldInvokeOnClient) {

                callOnClient(obj.command, 'invokeVariant', obj.invocationArg, handleCommandReturn);

            } else {

                var commandExecutor = CCP.Commands[obj.command];
                var returnValue = commandExecutor.invokeVariant(obj.invocationArg);
                handleCommandReturn(returnValue);

            }
        }

    };

})(CCP);