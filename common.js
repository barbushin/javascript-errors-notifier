var request = parseUrl(window.location.href);

function parseUrl(url) {
	var params = {};
	var a = /\?(.*)/.exec(url)[1].split('&');
	for(var i in a) {
		var b = a[i].split('=');
		params[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
	}
	if(params.tabId) {
		params.tabId = +params.tabId;
	}
	return params;
}


function sendMessage(data) {
	data._fromJEN = true;
	if(isIFrame) {
		window.top.postMessage(data, '*');
	}
	else if(request) {
		chrome.tabs.sendMessage(request.tabId, data);
	}
}

function autoSize() {
	if(isIFrame) {
		sendMessage({
			_resize: true,
			width: document.body.scrollWidth + 10,
			height: document.body.scrollHeight
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

var isIFrame = window.top != window;
window.onload = autoSize;