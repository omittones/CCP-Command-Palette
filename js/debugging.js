(function(window){

	var log = log4javascript.getLogger("main");
	var appender = new log4javascript.InPageAppender();
	log.addAppender(appender);
	appender.show();

	log.debug("This is a debugging message from the log4javascript in-page page");

	window.log = log;

})(window);
