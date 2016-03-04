var optionPrefix = 'notify_';

function getNotificationDomains() {
	var domains = [];
	for(var option in localStorage) {
		if(!option.indexOf(optionPrefix)) {
			domains.push(option.substr(optionPrefix.length - option.length));
		}
	}
	return domains;
}

function updateNotificationsDomains() {
	var oldDomains = getNotificationDomains();
	for(var i in oldDomains) {
		delete localStorage[optionPrefix + oldDomains[i]];
	}
	
	var domains = document.getElementById('notificationDomains').value.split('\n');
	for(var i in domains) {
		var domain = domains[i].trim().replace(/^.*?:\/\//, '');
		if(domain) {
			localStorage[optionPrefix + domain] = true;
		}
	}
}

document.addEventListener('DOMContentLoaded', function() {

	var options = {
		columnCheckbox: 'showColumn',
		traceCheckbox: 'showTrace',
		ignore404js: 'ignore404js',
		ignore404css: 'ignore404css',
		ignore404others: 'ignore404others',
		ignore404external: 'ignore404external'
	};

	var notificationDomainsElement = document.getElementById('notificationDomains');
	notificationDomainsElement.value = getNotificationDomains().join('\n');
	notificationDomainsElement.onchange = updateNotificationsDomains;
	notificationDomainsElement.onkeyup = updateNotificationsDomains;

	document.getElementById('domainsNotificationOptions').style.display = 'block';

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