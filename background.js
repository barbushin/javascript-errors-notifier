var notificationsHandler = new function() {

	var lastClearTime = null;
	var notifies = {};
	var index = 1;
	var self = this;
	var tabsNotifiesIds = {};

	function formatStack(stack) {
		var lines = [];
		for(var i in stack) {
			var call = stack[i];
			var line = '#' + call.num + (call.method ? ' ' + call.method : '');
			lines.push(line + ' ' + (line.length + call.url.length > 39 ? '...' + call.url.substr(-(36 - line.length)) : call.url));
		}
		return lines.join('\n');
	}

	this.showErrorsNotifications = function(errors, tabId) {
		var messages = [];
		for(var i in errors) {
			var error = errors[i];
			var source = error['url'] + ' ' + error['line'];
			messages.push({
				'tabId': tabId,
				'title': error['type'],
				'text': error['text'].replace(/^\w+:\s*/, '') + (error.stack ? '\n' + formatStack(error.stack) : ''),
				'buttons': [
					{
						'title': source.length <= 60 ? source : ('...' + source.substr(-57)),
						'url': 'view-source:' + error.url
					}
				]
			});
		}
		self.showNotifications(messages);
	};

	function displayNotification(message, callback) {
		index++;
		var id = 'jsen' + index;
		var obj = {
			'type': 'basic',
			'priority': 99,
			'buttons': [],
			'iconUrl': message['icon'] ? message['icon'] : 'img/js_error.png',
			'title': message['title'],
			'message': message['text']
		};

		var notify = {
			'url': message['url'] || null,
			'buttons': [],
			'callback': message['callback']
		};

		if(message['buttons']) {
			for(var i in message['buttons']) {
				var button = message['buttons'][i];
				obj['buttons'].push({
					'title': button['title'],
					'iconUrl': button['icon'] || null
				});
				notify.buttons.push({
					'type': 'link',
					'url': button['url']
				});
			}
		}

		if(message.tabId) {
			if(!tabsNotifiesIds[message['tabId']]) {
				tabsNotifiesIds[message['tabId']] = [id];
			}
			else {
				tabsNotifiesIds[message['tabId']].push(id);
			}
		}

		notifies[id] = notify;

		chrome.notifications.create(id, obj, callback);
	}

	this.closeTabNotifications = function(tabId, changeInfo) {
		if(tabsNotifiesIds[tabId] && (!changeInfo.status || changeInfo.status == 'loading')) {
			while(tabsNotifiesIds[tabId].length) {
				closeNotification(tabsNotifiesIds[tabId].pop());
			}
		}
	};

	function closeNotification(id, force) {
		if(!id) {
			//noinspection LoopStatementThatDoesntLoopJS
			for(var i in notifies) {
				id = i;
				break;
			}
		}
		if(id && notifies[id] && (!notifies[id]['permanent'] || force)) {
			removeNotify(id);
			chrome.notifications.clear(id, function() {
			});
		}
	}

	self.showNotifications = function(messages) {
		clearNotifications();
		popAndShow(messages);
	};

	function popAndShow(messages) {
		var message = messages.shift();
		message && displayNotification(message, function() {
			popAndShow(messages);
		});
	}

	self.showNotification = function(message, noClearPrevious) {
		self.showNotifications([message], noClearPrevious);
	};

	function clearNotifications() {
		var ids = Object.keys(notifies);
		if(new Date().getTime() - lastClearTime > 500) {
			for(var i in ids) {
				closeNotification(ids[i]);
			}
		}
		lastClearTime = new Date().getTime();
	}

	chrome.notifications.onClosed.addListener(function(id, byUser) {
		if(byUser) {
			clearNotifications();
		}
	});

	function openUrl(id) {
		if(notifies[id]['url']) {
			if(notifies[id]['callback']) {
				notifies[id]['callback']();
			}
			chrome.tabs.create({
				url: notifies[id]['url'],
				active: true
			});
		}
	}

	chrome.notifications.onClicked.addListener(function(id) {
		if(notifies[id]) {
			openUrl(id);
			removeNotify(id);
		}
	});

	chrome.notifications.onButtonClicked.addListener(function(id, buttonIndex) {
		if(notifies[id]) {
			if(notifies[id]['callback']) {
				notifies[id]['callback']();
			}
			var button = notifies[id]['buttons'][buttonIndex];
			chrome.tabs.create({
				'url': button['url'],
				'active': true
			});
			removeNotify(id);
		}
	});

	function removeNotify(id) {
		delete notifies[id];
	}
};

function htmlentities(str) {
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

// LISTENER

function formatStackForPopup(stack) {
	var lines = [];
	for(var i in stack) {
		var call = stack[i];
		lines.push('#' + call.num + ' ' + call.url + ' ' + call.method);
	}
	return lines.join('<br/>');
}

chrome.extension.onRequest.addListener(function(request, sender) {
	var errorsHtml = [];
	var stackLineRegExp = new RegExp('^(.*?)\\(?(https?://.*?)(\\)|$)');

	for(var i in request.errors) {
		var error = request.errors[i];

		error.text = error.text.replace(/^Uncaught /g, '');
		var m = new RegExp('^(\\w+):\s*(.+)').exec(error.text);
		error.type = m ? m[1] : 'Uncaught Error';

		if(localStorage['showColumn']) {
			error.line = error.line + ':' + error.col;
		}

		if(error.stack && localStorage['showTrace']) {
			var lines = error.stack.replace(/\n\s*at\s+/g, '\n').split('\n');
			lines.shift();
			for(var ii in lines) {
				var m = stackLineRegExp.exec(lines[ii]);
				lines[ii] = {
					num: lines.length - ii,
					url: m ? m[2] : lines[ii],
					method: (m && m[1].trim() ? m[1].trim() + '()' : '')
				};
			}
			error.stack = lines;
		}
		else {
			error.stack = null;
		}

		var sourceLink = error.url ? ('<br/>'
		+ (error.stack ? '#' + (lines.length + 1) + ' ' : '')
		+ '<a href="view-source:' + error.url + '" target="_blank">' + error.url.replace(/[\/\\]$/g, '') + (error.line ? ':' + error.line : '') + '</a>'
		) : '';

		var errorLink = '<a target="_blank" href="http://www.google.com/search?q=' + encodeURIComponent(htmlentities(error.text)) + '%20site%3Astackoverflow.com" id="">' + htmlentities(error.text) + '</a>';

		errorsHtml.push(errorLink + sourceLink + (error.stack ? '<br/>' + formatStackForPopup(error.stack) : ''));
	}

	chrome.pageAction.setPopup({
		tabId: sender.tab.id,
		popup: 'popup.html?errors=' + encodeURIComponent(errorsHtml.join('<br/><br/>')) + '&host=' + encodeURIComponent(request.host) + '&tabId=' + sender.tab.id
	});
	chrome.pageAction.show(sender.tab.id);

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request['_tabId']) {
			sendResponse({
				'tabId': sender.tab.id
			});
			return true;
		}
	});

	if(localStorage['notify_' + request.host]) {
		notificationsHandler.showErrorsNotifications(request.errors, sender.tab.id);
	}
});

chrome.tabs.onUpdated.addListener(notificationsHandler.closeTabNotifications);
