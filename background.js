
function htmlentities(str) {
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

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
