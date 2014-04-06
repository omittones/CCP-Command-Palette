$(function() {
    if (top != self) {
        $.get(
            '/_ajax/isframed',
            {
                location: document.location.pathname,
                referrer: document.referrer
            }
        );
    }
});
