var request = parseUrl(window.location.href);
var isIFrame = window.top != window;

function parseUrl(url) {
	var params = {};
	var query = /\?(.*)/.exec(url);
	if(query) {
		var kvPairs = query[1].split('&');
		for(var i in kvPairs) {
			var kv = kvPairs[i].split('=');
			params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
		}
		if(params.tabId) {
			params.tabId = +params.tabId;
		}
	}
	return params;
}

function sendMessage(data) {
	data._fromJEN = true;
	if(isIFrame) {
		window.top.postMessage(data, '*');
	}
	else if(request.tabId) {
		chrome.tabs.sendMessage(request.tabId, data);
	}
}

function autoSize() {
	if(isIFrame) {
		sendMessage({
			_resize: true,
			width: document.body.scrollWidth + 10,
			height: document.body.scrollHeight + 15
		}, '*');
	}
}

function closePopup(clear) {
	sendMessage({
		_closePopup: true
	});
	if(clear) {
		sendMessage({
			_clear: true
		});
	}
	if(!isIFrame) {
		window.close();
	}
}

window.onload = autoSize;