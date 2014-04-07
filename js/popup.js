var CCP = CCP || {};

(function(CCP) {

    function fuzzyMatch(searchSet, searchKeyAccessor, query) {

        function highlight(string) {
            return '<strong>' + string + '</strong>';
        }

        var tokens = query.toLowerCase().split(' ').join('');
        var matches = [];

        if (query === '') {

            searchSet.forEach(function(obj) {

                matches.push({
                    match: obj,
                    highlighted: searchKeyAccessor(obj),
                    positions: []
                });

            });

        } else {

            searchSet.forEach(function(obj) {

                var searchKey = searchKeyAccessor(obj);
                var normalizedSearchKey = searchKey.toLowerCase();

                var tokenIndex = 0,
                    positionInKey = 0,
                    matchWithHighlights = '',
                    matchedPositions = [];

                while (positionInKey < searchKey.length) {
                    if (normalizedSearchKey[positionInKey] === tokens[tokenIndex]) {
                        matchWithHighlights += highlight(searchKey[positionInKey]);
                        matchedPositions.push(positionInKey);
                        tokenIndex++;

                        if (tokenIndex >= tokens.length) {
                            matches.push({
                                match: obj,
                                highlighted: matchWithHighlights + searchKey.slice(positionInKey + 1),
                                positions: matchedPositions
                            });

                            break;
                        }
                    }
                    else {
                        matchWithHighlights += searchKey[positionInKey];
                    }

                    positionInKey++;
                }
            });
        }

        return matches;
    }

    var OS = {
        'unknown': 0,
        'mac': 1,
        'windows': 2,
        'linux': 3
    }

    var DEFAULT_PLACEHOLDER = 'Search or Type a Command';
    var _os = detectOS();

    function askUser(placeholder, callBack) {
        $('#commandField').val('');
        $('#suggestions').empty();
        if (typeof placeholder === 'undefined')
            placeholder = DEFAULT_PLACEHOLDER;
        $('#commandField').attr('placeholder', placeholder);
    }


    /*
     * Called when the user chooses a suggestion or if not suggestions are given
     * when the user presses enter.
     */
    function onUserChoice() {

        var selected = $('.selected');

        var command = $(selected).data('command');

        CCP.Engine.ExecuteCommand(command);
    }

    function searchKeyAccessor(command) {
        return command.caption;
    }

    /*
     * Repopulates the suggestions with
     * ask(arrayOfSuggestions, callBack(inputvalue:string) - optional)
     */
    function suggestToUser(suggestions, placeholder) {
        _callBack = null;

        $('#commandField').val('');
        if (typeof placeholder === 'undefined')
            placeholder = DEFAULT_PLACEHOLDER;
        $('#commandField').attr('placeholder', placeholder);

        populateSuggestions(suggestions);
    }

    /*
     * Clears and then fills the suggestions with possible suggestions
     */
    function populateSuggestions(suggestions) {

        var suggestionsElement = $('#suggestions');

        suggestionsElement.empty();

        /*
         * Creates a HTML element given a suggestion
         *
         * params:
         *   suggestionObject - suggestion
         * return:
         *   element - A suggestion HTML element
         */
        function createHTMLSuggestion(match) {

            var suggestionObject = match.match;


            var suggestion = $('<a>');
            suggestion.addClass('suggestion');

            // Data
            $(suggestion).data('command', suggestionObject);

            // Image
            if (suggestionObject.image) {
                var imgElement = $('<img>');
                $(imgElement).addClass('icon');
                $(imgElement).attr('src', suggestionObject.image);
                $(suggestion).append(imgElement);
            }

            // Caption
            suggestion.append($('<span>').addClass('caption').html(match.highlighted));

            // Desciption
            if (suggestionObject.description)
                suggestion.append($('<span>').addClass('description').text(suggestionObject.description));

            // Shortcut
            if (suggestionObject.shortcut) {
                var shortcutElement = $('<span>').addClass('shortcut');
                var shortcutKeys;
                switch(_os) {
                    case OS.mac:
                        shortcutKeys = suggestionObject.shortcut.mac;
                        break;
                    case OS.windows:
                        shortcutKeys = suggestionObject.shortcut.windows;
                        break;
                    case OS.linux:
                        shortcutKeys = suggestionObject.shortcut.linux; // @TODO: support linux shortcuts
                        break;
                    default:
                        shortcutKeys = suggestionObject.shortcut.windows;
                        break;
                }
                if (shortcutKeys) {
                    for (var i = 0; i < shortcutKeys.length; i++) {
                        $(shortcutElement).append($('<span>').text(shortcutKeys[i]).addClass('key'));
                        if (_os != OS.mac)
                            if (i != shortcutKeys.length - 1)
                                $(shortcutElement).append('+');
                    };
                    suggestion.append(shortcutElement);
                }
            }
            return suggestion;
        }

        // The value of the input ignoring bad characters
        var commandFieldVal = $('#commandField').val().replace(/\W/g, '');

        // Fuzzy search for results Fill with results
        var results = fuzzyMatch(suggestions, searchKeyAccessor, commandFieldVal);
        for (var i = results.length - 1; i >= 0; i--) {
            var suggestion = createHTMLSuggestion(results[i]);
            suggestionsElement.prepend(suggestion);
        };
        if (results.length > 0)
            selectSuggestion($('.suggestion').first());
    }


    /*
     * Deselect any current suggestions, selects a given suggestions.
     * and then scrolls to show selection.
     */
    function selectSuggestion(suggestionElement) {

        $('.selected').removeClass('selected');
        $(suggestionElement).addClass('selected');

        //preview command, like link highlight or similar
        var command = $(suggestionElement).data('command');
        CCP.Engine.PreviewCommand(command);

        /* Scroll suggestion into view */
        var offset = $(suggestionElement).position().top; // Suggestion's offset from parent
        var suggestionHeight = $(suggestionElement).outerHeight();
        var suggestionsHeight = $('#suggestions').height();
        var suggestionsScrollTop = $('#suggestions').scrollTop();
        if (offset + suggestionHeight > suggestionsHeight) { // If element is beneath view
            offset += suggestionsScrollTop - (suggestionsHeight - suggestionHeight);
            $('#suggestions').stop(true); // Stop any current animations
            $('#suggestions').animate({ scrollTop: offset }, 100);
        } else if (offset < 0) { // If element is above view
            offset += suggestionsScrollTop;
            $('#suggestions').stop(true); // Stop any current animations
            $('#suggestions').animate({ scrollTop: offset }, 100);
        }
    }

    /*
     *  DOM Ready
     */
    $(document).ready(function() {

        // Bring focus to the input box, to make the user feel safe
        $('#commandField').focus();

        // Ask user about command suggestions
        CCP.Engine.GetAllCommands(function(suggestions) {

            suggestToUser(suggestions);

            $('#commandField').on('input', function() {
                populateSuggestions(suggestions);
            })

            // On keydown
            $(document).on('keydown', function(e) {
                $('#commandField').focus();
                var selected =  $('.selected');
                if (selected) {
                    if (e.which == 40 || e.which == 9) { // Down arrow and Tab Keycodes
                        e.preventDefault();
                        var next = (selected).next('.suggestion');
                        if (next.length != 0) {
                            selectSuggestion(next);
                        } else {
                            var first = $('.suggestion').first();
                            if (first.length != 0)
                                selectSuggestion(first);
                        }
                    } else if (e.which == 38) { // Up Arrow Keycode
                        e.preventDefault();
                        var prev = (selected).prev('.suggestion');
                        if (prev.length != 0) {
                            selectSuggestion(prev);
                        } else {
                            var last = $('.suggestion').last();
                            if (last.length != 0)
                                selectSuggestion(last);
                        }
                    } else if (e.which == 8) { // Backspace Keycode
                        if ($('#commandField').val() == '') {
                            suggestToUser(suggestions);
                        }
                    }
                }

            });

        });

        // On Click
        $('#suggestions').on('click', '.suggestion', function(e) {
            selectSuggestion($(this));
            onUserChoice();
        });

        // On keyup
        $('#commandField').keyup(function(e) {
            if (e.which == 13) { // Enter Keycode
                onUserChoice();
            }
        });
    });

    /*
     * Returns the believed Operating System of the user
     */
    function detectOS() {
        if (navigator.appVersion.indexOf("Win")!=-1) return OS.windows;
        if (navigator.appVersion.indexOf("Mac")!=-1) return OS.mac;
        if (navigator.appVersion.indexOf("X11")!=-1) return OS.linux;
        if (navigator.appVersion.indexOf("Linux")!=-1) return OS.linux;
        return OS.unknown;
    }

})(CCP);