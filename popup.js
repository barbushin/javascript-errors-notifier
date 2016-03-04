function parseQuery(query) {
	var params = {};
	var a = query.split('&');
	for(var i in a) {
		var b = a[i].split('=');
		params[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
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

document.addEventListener('DOMContentLoaded', function() {
	var request = parseQuery(window.location.search.substr(1));
	document.getElementById('errors').innerHTML = request.errors;

	request.host = decodeURIComponent(new RegExp('.*?\\&host=(.+)&', 'g').exec(window.location.href)[1]);
	request.tabId = +decodeURIComponent(new RegExp('.*?\\&tabId=(.+)', 'g').exec(window.location.href)[1]);

	document.getElementById('clearLink').onclick = function() {
		chrome.pageAction.hide(request.tabId);
		chrome.tabs.sendMessage(request.tabId, {
			'_clear': true,
			'tabId': request.tabId
		});
		window.close();
	};

	document.getElementById('copyLink').onclick = function() {
		var isWindows = navigator.appVersion.indexOf('Windows') != -1;
		copyToClipboard(request.errors.replace(/<br\/>/g, isWindows ? '\r\n' : '\n').replace(/<.*?>/g, ''));
		window.close();
	};
});

