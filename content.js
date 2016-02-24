new function() {

	var errors = [];
	var tabId = null;
	var timer = null;

	document.addEventListener('ErrorToExtension', function(e) {
		var error = e.detail;
		var lastError = errors[errors.length - 1];
		if(!lastError || (lastError.text != error.text || lastError.url != error.url || lastError.line != error.line)) {
			errors.push(error);
			if(!timer) {
				timer = window.setTimeout(function() {
					timer = null;
					chrome.extension.sendRequest({
						errors: errors,
						host: window.location.host
					});
				}, 200);
			}
		}
	});

	function codeToInject() {

		function handleUserError(text) {
			var e = new Error();
			var stack = e.stack.split("\n");
			var callSrc = (stack.length > 3 && (/^.*?\((.*?):(\d+):(\d+)/.exec(stack[3]) || /(\w+:\/\/.*?):(\d+):(\d+)/.exec(stack[3]))) || [null, null, null, null];
			delete stack[1];
			delete stack[2];
			document.dispatchEvent(new CustomEvent('ErrorToExtension', {
				detail: {
					stack: stack.join("\n"),
					url: callSrc[1],
					line: callSrc[2],
					col: callSrc[3],
					text: text
				}
			}));
		}

		// handle console.error()
		var consoleErrorFunc = window.console.error;
		window.console.error = function(text) {
			consoleErrorFunc.call(console, text);
			handleUserError(text);
		};

		// handle uncaught errors
		window.addEventListener('error', function(e) {
			if(e.filename) {
				document.dispatchEvent(new CustomEvent('ErrorToExtension', {
					detail: {
						stack: e.error ? e.error.stack : null,
						url: e.filename,
						line: e.lineno,
						col: e.colno,
						text: e.message
					}
				}));
			}
		});

		// handle 404 errors
		window.addEventListener('error', function(e) {
			var src = e.target.src || e.target.href;
			var baseUrl = e.target.baseURI;
			if(src && baseUrl && src != baseUrl) {
				document.dispatchEvent(new CustomEvent('ErrorToExtension', {
					detail: {
						is404: true,
						url: src
					}
				}));
			}
		}, true);
	}

	var script = document.createElement('script');
	script.textContent = '(' + codeToInject + '())';
	(document.head || document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);

	chrome.runtime.sendMessage({
		'_tabId': true
	}, function(response) {
		if(response) {
			tabId = response['tabId'];
		}
	});

	chrome.runtime.onMessage.addListener(function(request) {
		if(request['_clear'] && request['tabId'] == tabId) {
			errors = [];
		}
	});

};
