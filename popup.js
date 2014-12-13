document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('errors').innerHTML = decodeURIComponent(new RegExp('.*?\\?errors=(.+)&', 'g').exec(window.location.href)[1]);

	var host = decodeURIComponent(new RegExp('.*?\\&host=(.+)&', 'g').exec(window.location.href)[1]);
	var tabId = +decodeURIComponent(new RegExp('.*?\\&tabId=(.+)', 'g').exec(window.location.href)[1]);

	document.getElementById('notificationOptionText').innerHTML = 'Show notification popups for errors on <strong>' + host + '</strong> domain';

	var options = {
		columnCheckbox: 'showColumn',
		traceCheckbox: 'showTrace',
		notifyCheckbox: 'notify_' + host
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
				else if(localStorage[option]) {
					delete localStorage[option];
				}
			}
		})(option);
	}
	document.getElementById('optionsLink').onclick = function() {
		this.parentNode.parentNode.remove();
		document.getElementById('optionsBlock').style.display = 'block';
	};

	document.getElementById('clearLink').onclick = function() {
		chrome.pageAction.hide(tabId);
		chrome.tabs.sendMessage(tabId, {
			'_clear': true,
			'tabId': tabId
		});
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

