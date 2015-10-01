var gulp = require('gulp');
var notify = require("gulp-notify");
var intercept = require('gulp-intercept');
var lastErrorTime = null;
var myRegx = /\[(.*?)\] \[(.*?)\] \[(.*?)\] \[(.*?)\]/i;
var logPath = "/var/log/apache2/error.log";

gulp.task('default', ['watch']);

gulp.task('watch', function() {

	gulp.watch([logPath]).on('change', function(file) {
		gulp.src([file.path])
		    .pipe(intercept(function(fileScaned){
		    	var errorLines = fileScaned.contents.toString().split('\n'),
		    		errorTempLines = [],
		    		displayLines = [],
		    		lastDisplayLines = 1;

		    	for (var i = 0; i < errorLines.length; i++) {
		    		if(errorLines[i].indexOf("PHP Fatal error:") > -1){
		    			errorTempLines.push(errorLines[i]);
		    		}
		    	};

		    	if(errorTempLines.length <= lastDisplayLines){
		    		displayLines = errorTempLines;
		    	} else {
			    	for (var i = 0; i < lastDisplayLines; i++) {
			    		var error = errorTempLines[errorTempLines.length - lastDisplayLines - i],
			    			errorArray = error.split("PHP Fatal error:"),
			    			errorTime = myRegx.exec(errorArray[0])[1],
			    			errorMsg = errorArray[1];

			    		if(lastErrorTime != errorTime){
				    		displayLines.push(errorMsg);
				    		
				    		lastErrorTime = errorTime;
			    		}
			    	};
		    	}

		    	if(displayLines.length){
		    		gulp.src(file.path).pipe(notify("Time: "+lastErrorTime+"\n "+ displayLines.join("\n\n")));
		    	}
		    }));
    })
});