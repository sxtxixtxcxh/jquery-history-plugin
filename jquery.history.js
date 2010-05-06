/*
 * jQuery history plugin
 * 
 * sample page: http://www.mikage.to/jquery/jquery_history.html
 *
 * Copyright (c) 2006-2009 Taku Sano (Mikage Sawatari)
 * Copyright (c) 2010 Takayuki Miwa
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Modified by Lincoln Cooper to add Safari support and only call the callback once during initialization
 * for msie when no initial hash supplied.
 */

(function($) {
    // public base interface
    var HistoryBase = {
        historyCurrentHash: undefined,
        historyCallback: undefined,
        historyInit:  function(callback) {},
        historyCheck: function() {},
        historyLoad:  function(hash) {}
    };

    var SimpleImpl = {
        historyInit: function(callback) {
            jQuery.historyCallback = callback;
            var current_hash = location.hash.replace(/\?.*$/, '');
            jQuery.historyCurrentHash = current_hash;
            if(current_hash) {
                jQuery.historyCallback(current_hash.replace(/^#/, ''));
            }
            setInterval(jQuery.historyCheck, 100);
        },
        historyCheck: function() {
            var current_hash = location.hash.replace(/\?.*$/, '');
            if(current_hash != jQuery.historyCurrentHash) {
                jQuery.historyCurrentHash = current_hash;
                jQuery.historyCallback(current_hash.replace(/^#/, ''));
            }
        },
        historyLoad: function(hash) {
            var newhash;
            hash = decodeURIComponent(hash.replace(/\?.*$/, ''));
            newhash = '#' + hash;
            location.hash = newhash;
            jQuery.historyCurrentHash = newhash;
            jQuery.historyCallback(hash);
        }
    };

    var IframeImpl = {
        historyIframeSrc: undefined,
        historyInit: function(callback, src) {
            jQuery.historyCallback = callback;
            if (src) {
                jQuery.historyIframeSrc = src;
            }
            var current_hash = location.hash.replace(/\?.*$/, '');
            jQuery.historyCurrentHash = current_hash;

            // To stop the callback firing twice during initilization if no hash present
            if (jQuery.historyCurrentHash == '') {
                jQuery.historyCurrentHash = '#';
            }
                
            // add hidden iframe for IE
            jQuery("body").prepend('<iframe id="jQuery_history" style="display: none;"'+
                                   ' src="javascript:false;"></iframe>');
            var ihistory = jQuery("#jQuery_history")[0];
            var iframe = ihistory.contentWindow.document;
            iframe.open();
            iframe.close();
            iframe.location.hash = current_hash;

            if(current_hash) {
                jQuery.historyCallback(current_hash.replace(/^#/, ''));
            }
            setInterval(jQuery.historyCheck, 100);
        },
        historyCheck: function() {
            // On IE, check for location.hash of iframe
            var ihistory = jQuery("#jQuery_history")[0];
            var iframe = ihistory.contentDocument || ihistory.contentWindow.document;
            var current_hash = iframe.location.hash.replace(/\?.*$/, '');
            if(current_hash != jQuery.historyCurrentHash) {
                location.hash = current_hash;
                jQuery.historyCurrentHash = current_hash;
                jQuery.historyCallback(current_hash.replace(/^#/, ''));
            }
        },
        historyLoad: function(hash) {
            var newhash;
            hash = decodeURIComponent(hash.replace(/\?.*$/, ''));
            newhash = '#' + hash;
            location.hash = newhash;

            jQuery.historyCurrentHash = newhash;
            var ihistory = jQuery("#jQuery_history")[0];
            var iframe = ihistory.contentWindow.document;
            iframe.open();
            iframe.close();
            iframe.location.hash = newhash;
            jQuery.lastHistoryLength = history.length;
            jQuery.historyCallback(hash);
        }
    };

    jQuery.extend(HistoryBase);
    if(jQuery.browser.msie && (jQuery.browser.version < 8 || document.documentMode < 8)) {
        jQuery.extend(IframeImpl);
    } else {
        jQuery.extend(SimpleImpl);
    }
})(jQuery);
