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

function copyToClipboard(str) {
	document.oncopy = function(event) {
		event.clipboardData.setData('text/plain', str);
		event.preventDefault();
	};
	document.execCommand('Copy', false, null);
}

function initOptionSwitcher(imgNode, option, srcValues) {
	imgNode.src = srcValues[+!!localStorage[option]]; // :D
	imgNode.onclick = function() {
		localStorage[option] = !!localStorage[option] ? '' : 1; // :D
		imgNode.src = srcValues[+localStorage[option]];
	};
}

document.addEventListener('DOMContentLoaded', function() {
	var errorsNode = document.getElementById('errors');
	var copyNode = document.getElementById('copy');
	var clearNode = document.getElementById('clear');

	var iconNode = document.getElementById('showIcon');
	iconNode.title = 'Show error notification icon on ' + request.host;
	initOptionSwitcher(iconNode, 'icon_' + request.host, [
		'img/icon_off.png',
		'img/icon_on.png'
	]);

	var popupNode = document.getElementById('showPopup');
	popupNode.title = 'Show popup with error details on ' + request.host;
	initOptionSwitcher(popupNode, 'popup_' + request.host, [
		'img/popup_off.png',
		'img/popup_on.png'
	]);

	if(!request.errors) {
		errorsNode.innerHTML = '<p style="padding: 20px">There are no errors on this page :)</p>';
		copyNode.remove();
		clearNode.remove();
	}
	else {
		errorsNode.innerHTML = request.errors;

		clearNode.onclick = function() {
			closePopup(isIFrame);
		};

		copyNode.onclick = function() {
			var isWindows = navigator.appVersion.indexOf('Windows') != -1;
			copyToClipboard(request.errors.replace(/<br\/>/g, isWindows ? '\r\n' : '\n').replace(/<.*?>/g, ''));
			closePopup();
		};
	}

	window.addEventListener('message', function(event) {
		if(typeof event.data == 'object' && event.data._reloadPopup) {
			request = parseUrl(event.data.url);
			errorsNode.innerHTML = request.errors;
			setTimeout(autoSize, 100);
		}
	});
});

