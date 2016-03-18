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