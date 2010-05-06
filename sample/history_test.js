$(document).ready(function() {
	var Logger = {
	    clear: function() {
		$('#history-log').val("");
	    },
	    append: function(text) {
		var dom = $('#history-log').get(0);
		dom.value+= text + "\n";
		dom.scrollTop = dom.scrollHeight;
	    }
	};

	if($.browser.msie && $.browser.version == 8) {
	    $('#ie-info').text('You are using IE8 in version '+ document.documentMode +' compatible mode.');
	}

	$.historyInit(function (hash) {
		Logger.append("[callback called] hash="+ hash);
		if(hash) {
		    $("#load").text("loaded: "+ hash);
		} else {
		    // start page
		    $("#load").empty();
		}
		$('#hash-input').val(hash);
	    });

	function loadHistory(hash) {
	    Logger.append('[load history] hash='+ hash);
	    $.historyLoad(hash);
	}
	
	$(".history-links a").click(function(){
		var hash = this.href;
		hash = hash.replace(/^.*#/, '');
		Logger.append("[link clicked] href="+ this.href);
		loadHistory(hash);
		return false;
	    });

	$('#load-hash').click(function() {
		var hash = $('#hash-input').val();
		if(hash) {
		    loadHistory(hash);
		}
	    });
    });
