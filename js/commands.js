var CCP = CCP || {};


CCP.Commands = {

    CommandStatics : {

        shouldInitiateOnClient : function() {
            return false;
        },

        getVariants : function() {
            var commands = [
                {
                    'caption': 'About',
                    'invocationArg' : { 'command': 'openNewTab', 'args': {'url': 'about.html'} }
                },
                {
                    'caption': 'Browser Data: Clear Cache',
                    'shortcut': {'windows': ['Ctrl','Shift','Delete'] },
                    'invocationArg' : { 'command': 'removeBrowsingData', 'args': {'dataToRemove': {'cache': true } } }
                },
                {
                    'caption': 'Browser Data: Delete History',
                    'shortcut': {'windows': ['Ctrl','Shift','Delete'], 'mac': ['⌘','⇧','⌫'] },
                    'invocationArg' : { 'command': 'suggestHistory' }
                },
                {
                    'caption': 'Goto: Downloads',
                    'shortcut': {'windows': ['Ctrl','Shift','J'], 'mac': ['⌘','⇧','J'] },
                    'invocationArg' : { 'command': 'openNewTab', 'args': {'url': 'chrome://downloads/'} }
                },
                {
                    'caption': 'Goto: Extentions',
                    'invocationArg' : { 'command': 'openNewTab', 'args': {'url': 'chrome://extensions/'} }
                },
                {
                    'caption': 'Goto: History',
                    'shortcut': {'windows': ['Ctrl','H'], 'mac': ['⌘','H'] },
                    'invocationArg' : { 'command': 'openNewTab', 'args': {'url': 'chrome://history/'} }
                },
                {
                    'caption': 'Goto: Settings',
                    'invocationArg' : { 'command': 'openNewTab', 'args': {'url': 'chrome://settings/'} }
                },
                {
                    'caption': 'Page: Print',
                    'shortcut': {'windows': ['Ctrl','P'], 'mac': ['⌘','P'] },
                    'invocationArg' : { 'command': 'printPage' }
                },
                {
                    'caption': 'Tab: Close Current',
                    'shortcut': {'windows': ['Ctrl','W'], 'mac': ['⌘','W'] },
                    'invocationArg' : { 'command': 'closeCurrentTab' }
                },
                {
                    'caption': 'Tab: Close All Others',
                    'invocationArg' : { 'command': 'closeAllOtherTabs' }
                },
                {
                    'caption': 'Tab: Duplicate Current',
                    'invocationArg' : { 'command': 'duplicateCurrentTab' }
                },
                {
                    'caption': 'Tab: Open New',
                    'shortcut': { 'windows': ['Ctrl','T'], 'mac': ['⌘','T'] },
                    'invocationArg' : { 'command': 'openNewTab', 'args': {}, }
                },
                {
                    'caption': 'Tab: Reload Current',
                    'shortcut': {'windows': ['Ctrl','R'], 'mac': ['⌘','R'] },
                    'invocationArg' : { 'command': 'reloadCurrentTab' }
                },
                {
                    'caption': 'Tab: Restore Closed',
                    'invocationArg' : { 'command': 'suggestClosedTab' }
                },
                {
                    'caption': 'Tab: Switch To',
                    'invocationArg' : { 'command': 'suggestTabs' }
                },
                {
                    'caption': 'Tab: Toggle Pin',
                    'invocationArg' : { 'command': 'toggleTabPin' }
                },
                {
                    'caption': 'Window: Open New',
                    'shortcut': {'windows': ['Ctrl','N'], 'mac': ['⌘','N'] },
                    'invocationArg' : { 'command': 'createWindow' }
                },
                {
                    'caption': 'Window: Open New Incognito',
                    'shortcut': {'windows': ['Ctrl','Shift','N'], 'mac': ['⌘','⇧','N'] },
                    'invocationArg' : { 'command': 'createWindow', 'args': { 'incognito': true } }
                }
            ];

            return CCP.Utils.map(commands, function(obj) {
                obj.shouldInvokeOnClient = false;
                return obj;
            });
        },

        highlightVariant : function(arg) {

        },

        unlightVariant : function(arg) {

        },

        invokeVariant : function(arg) {

            console.debug('Invoking helper method ' + arg.command);

            var funct = CCP.StaticCommandHelpers[arg.command];
            var args = arg.args;

            funct(args);

            return { closeContext:true };
        }

    },

    CommandClickAnchor : {

        shouldInitiateOnClient : function() {
            return true;
        },

        getVariants : function() {

            var variants = [];

            var anchorNodes = document.querySelectorAll('a');
            console.debug('Found ' + anchorNodes.length + ' total anchors...');

            var hmap = {};
            CCP.Utils.each(anchorNodes, function(node) {
                if (hmap[node.innerText] === undefined)
                    hmap[node.innerText] = [];
                hmap[node.innerText].push(node);
            });

            function pushCommand(anchorNode, text) {

                if (text === '') return;
                var selector;
                if (anchorNode.id)
                    selector = '#' + anchorNode.id;
                else if (anchorNode.attributes && anchorNode.attributes['href'])
                    selector = 'a[href="' + anchorNode.attributes['href'].value + '"]';
                else
                    return;

                variants.push({ 'caption': 'Click link: ' + text, 'invocationArg':selector, 'shouldInvokeOnClient':true });
            }

            for(var key in hmap) {
                var group = hmap[key];
                if (group.length == 1) {
                    pushCommand(group[0], key);
                } else {
                    for(var i = 0; i < group.length; i++) {
                        pushCommand(group[i], group[i].parentElement.innerText);
                    }
                }
            }

            console.debug('Found ' + variants.length + ' valid anchors...');

            return variants;
        },

        _oldStyles : {},

        highlightVariant : function(selector) {

            var node = document.querySelector(selector);
            this._oldStyles[selector] = { backgroundColor:node.style.backgroundColor, padding:node.style.padding };
            node.style.backgroundColor = '#aaaaaa';
            node.style.padding = '5px';

        },

        unlightVariant : function(selector) {

            var old = this._oldStyles[selector];
            this._oldStyles[selector] = null;
            var node = document.querySelector(selector);
            node.style.backgroundColor = old.backgroundColor;
            node.style.padding = old.padding;

        },

        invokeVariant : function(selector) {
            console.debug('Ivoking click action on ' + selector);
            document.querySelector(selector).click();
            return { closeContext:true };
        }
    },

    CommandFocusOnInput : {

        shouldInitiateOnClient : function() {
            return true;
        },

        getVariants : function() {

            var inputNodes = document.querySelectorAll('input[type="text"]');
            inputNodes = CCP.Utils.map(inputNodes, function(inputNode) {

                var selector;
                var labelAccessor;
                if (inputNode.id) {
                    selector = '#' + inputNode.id;
                    labelAccessor = function() { return document.querySelector('label[for="' + inputNode.id + '"]'); };
                }
                else if (inputNode.name) {
                    selector = 'input[name="' + inputNode.name + '"]';
                    labelAccessor = function() { return null; };
                }
                else
                    return null;

                var text = null;
                if (inputNode.placeholder)
                    text = inputNode.placeholder;
                else {
                    var label = labelAccessor();
                    if (label) text = label.innerText;
                }

                if (text == null) return null;

                return { 'caption': 'Focus text input: ' + text, 'invocationArg':selector, 'shouldInvokeOnClient':true };
            });

            inputNodes = CCP.Utils.filter(inputNodes, function(obj) { return obj !== null; });

            console.debug('Found ' + inputNodes.length + ' valid text inputs...');

            return inputNodes;
        },

        highlightVariant : function(selector) {

        },

        unlightVariant : function(selector) {

        },

        invokeVariant : function(selector) {
            console.debug('Ivoking focus action on ' + selector);
            document.querySelector(selector).focus();
            return { closeContext:true };
        }
    }

};

CCP.StaticCommandHelpers = {

    updateTab : function (obj) {
        chrome.tabs.update(obj.tabId, obj.updateProperties);
    },
    printPage : function () {
        chrome.tabs.update(null, {url: 'javascript:window.print();'});
    },
    closeAllOtherTabs : function () {
        chrome.windows.getCurrent({populate: true}, function(window) {
            var tabIDs = [];
            for (var i = window.tabs.length - 1; i >= 0; i--) {
                var currentTab = window.tabs[i];
                if (!currentTab.pinned && !currentTab.active)
                    tabIDs.push(window.tabs[i].id);
            };
            chrome.tabs.remove(tabIDs);
        });
    },
    getCurrentTab : function (callBack) {
        chrome.windows.getCurrent({populate: true}, function(window) {
            for (var i = window.tabs.length - 1; i >= 0; i--) {
                if (window.tabs[i].active)
                    if (callBack)
                        callBack(window.tabs[i]);
            };
        });
    },
    closeCurrentTab : function () {
        getCurrentTab(function(tab) {
            chrome.tabs.remove(tab.id);
        });
    },
    toggleTabPin : function () {
        getCurrentTab(function(tab) {
            if (tab.pinned)
                chrome.tabs.update(tab.id, { 'pinned': false });
            else
                chrome.tabs.update(tab.id, { 'pinned': true });
        });
    },
    duplicateCurrentTab : function () {
        getCurrentTab(function(tab) {
            chrome.tabs.duplicate(tab.id);
        });
    },
    reloadCurrentTab : function () {
        chrome.tabs.reload();
    },
    createWindow : function (obj) {
        chrome.windows.create(obj);
    },
    removeBrowsingData : function (obj) {
        chrome.browsingData.remove(obj.options, obj.dataToRemove);
    },
    openNewTab : function (obj) {
        chrome.tabs.create(obj);
    },
    switchToTab : function (obj) {
        alert('Switching to ' + obj.title);
    }
}






// function suggestHistory() {
//     var date = new Date();
//     var currentTime = date.getTime();
//     var hour = 3600000;
//     var day = 24 * hour;
//     var week = 7 * day;
//     var suggesitons = [
//         { 'caption': 'The past hour', 'command': 'removeBrowsingData', 'args': {'options' : {'since': currentTime - hour}, 'dataToRemove': {'history': true}}, 'closeOnComplete': true },
//         { 'caption': 'The past day', 'command': 'removeBrowsingData', 'args': {'options' : {'since': currentTime - day}, 'dataToRemove': {'history': true}}, 'closeOnComplete': true },
//         { 'caption': 'The past week', 'command': 'removeBrowsingData', 'args': {'options' : {'since': currentTime - week}, 'dataToRemove': {'history': true}}, 'closeOnComplete': true },
//         { 'caption': 'The last 4 weeks', 'command': 'removeBrowsingData', 'args': {'options' : {'since': currentTime - (4 * week)}, 'dataToRemove': {'history': true}}, 'closeOnComplete': true },
//         { 'caption': 'The beginning of time', 'command': 'removeBrowsingData', 'args': {'options' : {'since': 0}, 'dataToRemove': {'history': true}}, 'closeOnComplete': true }
//     ];
//     suggestToUser(suggesitons, 'Choose a time frame');
// }

// function suggestTabs() {
//     chrome.windows.getAll({ 'populate': true }, function(windows) {
//         var suggestions = [];
//         for (var i = windows.length - 1; i >= 0; i--) {
//             for (var j = windows[i].tabs.length - 1; j >= 0; j--) {
//                 var suggestion = {};
//                 var currentTab = windows[i].tabs[j];
//                 suggestion.caption = currentTab.title + ' - ' + currentTab.url;
//                 suggestion.command = 'updateTab';
//                 suggestion.args = { 'tabId': currentTab.id, 'updateProperties': { 'active': true } };
//                 log.info(currentTab.favIconUrl);
//                 if (currentTab.favIconUrl == '' || currentTab.favIconUrl === undefined)
//                     suggestion.image = 'images/defaultFavicon.png';
//                 else
//                     suggestion.image = currentTab.favIconUrl;
//                 suggestions.push(suggestion);
//             };
//         };
//         suggestToUser(suggestions, 'Search or Type a Tab');
//     });
// }

// // Ask Functions. Pass string to callBack
// function askForEchoValue() {
//     askUser('Type a value to echo', function(str) {
//         alert(str);
//     });
// }