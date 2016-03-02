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

	document.getElementById('notificationOptionText').innerHTML = 'Show notification popups for errors on <strong>' + request.host + '</strong> domain';

	var options = {
		columnCheckbox: 'showColumn',
		traceCheckbox: 'showTrace',
		notifyCheckbox: 'notify_' + request.host,
		ignore404js : 'ignore404js',
		ignore404css: 'ignore404css',
		ignore404others: 'ignore404others',
		ignore404external: 'ignore404external'
	};

	for(var id in options) {
		var option = options[id];
		var checkbox = document.getElementById(id);
		if(localStorage[option]) {
			checkbox.checked = true;
		}
		checkbox.onchange = (function(option) {
			return function() {
				if(this.checked) {
					localStorage[option] = true;
				}
				else {
					if(localStorage[option]) {
						delete localStorage[option];
					}
				}
			}
		})(option);
	}
	document.getElementById('optionsLink').onclick = function() {
		this.parentNode.remove();
		document.getElementById('optionsBlock').style.display = 'block';
	};

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
		copyToClipboard(request.errors.replace(/<br\/>/g,  isWindows ? '\r\n' : '\n').replace(/<.*?>/g, ''));
		window.close();
	};

	if(localStorage['jscrNotified'] || localStorage['isRecommended']) {
		document.getElementById('recommendation').remove();
	}
	else {
		var linksIds = ['openRecommendation', 'hideRecommendation'];
		for(var i in linksIds) {
			document.getElementById(linksIds[i]).onclick = function() {
				localStorage['isRecommended'] = 3;
				window.close();
				return this.id == 'openRecommendation';
			};
		}
	}
});

