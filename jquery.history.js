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
    var locationWrapper = {
        put: function(hash, win) {
            (win || window).location.hash = encodeURIComponent(hash);
        },
        get: function(win) {
            var hash = ((win || window).location.hash).replace(/^#/, '');
            return $.browser.fx ? hash : decodeURIComponent(hash);
        }
    };

    var iframeWrapper = {
        id: "__jQuery_history",
        init: function() {
            var html = '<iframe id="'+ this.id +'" style="display:none" src="javascript:false;" />';
            jQuery("body").prepend(html);
            return this;
        },
        _document: function() {
            return jQuery("#"+ this.id)[0].contentWindow.document;
        },
        put: function(hash) {
            var doc = this._document();
            doc.open();
            doc.close();
            locationWrapper.put(hash, doc);
        },
        get: function() {
            return locationWrapper.get(this._document());
        }
    };

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
            var current_hash = locationWrapper.get();
            jQuery.historyCurrentHash = current_hash;
            if(current_hash) {
                jQuery.historyCallback(current_hash);
            }
            setInterval(jQuery.historyCheck, 100);
        },
        historyCheck: function() {
            var current_hash = locationWrapper.get();
            if(current_hash != jQuery.historyCurrentHash) {
                jQuery.historyCurrentHash = current_hash;
                jQuery.historyCallback(current_hash);
            }
        },
        historyLoad: function(hash) {
            var newhash = hash;
            locationWrapper.put(newhash);
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
            var current_hash = locationWrapper.get();
            jQuery.historyCurrentHash = current_hash;
            iframeWrapper.init().put(current_hash);
            if(current_hash) {
                jQuery.historyCallback(current_hash);
            }
            setInterval(jQuery.historyCheck, 100);
        },
        historyCheck: function() {
            var current_hash = iframeWrapper.get();
            if(current_hash != jQuery.historyCurrentHash) {
                locationWrapper.put(current_hash);
                jQuery.historyCurrentHash = current_hash;
                jQuery.historyCallback(current_hash);
            }
        },
        historyLoad: function(hash) {
            var newhash = hash;

            locationWrapper.put(newhash);
            jQuery.historyCurrentHash = newhash;
            iframeWrapper.put(newhash);

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
