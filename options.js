document.addEventListener('DOMContentLoaded', function() {
	var optionsIds = [
		'showIcon',
		'showPopup',
		'showPopupOnMouseOver',
		'showColumn',
		'showTrace',
		'linkStackOverflow',
		'linkViewSource',
		'relativeErrorUrl',
		'ignore404js',
		'ignore404css',
		'ignore404others',
		'ignoreExternal',
		'ignoreBlockedByClient',
		'ignoreConnectionRefused',
		'popupMaxWidth',
		'popupMaxHeight'
	];

	for(var i in optionsIds) {
		var option = optionsIds[i];
		var value = localStorage[option];
		var input = document.getElementById(option);

		if(input.type == 'checkbox') {
			if(value) {
				input.checked = true;
			}
			input.onchange = (function(option) {
				return function() {
					localStorage[option] = this.checked ? 1 : '';
				}
			})(option);
		}
		else {
			input.value = value;
			input.onkeyup = (function(option) {
				return function() {
					localStorage[option] = this.value;
				}
			})(option);
		}
	}

	document.getElementById('close').onclick = function() {
		closePopup();
	};

	if(localStorage['jscrNotified'] || localStorage['isRecommended']) {
		document.getElementById('recommendation').remove();
	}
	else {
		var linksIds = ['openRecommendation', 'hideRecommendation'];
		for(var i in linksIds) {
			document.getElementById(linksIds[i]).onclick = function() {
				localStorage['isRecommended'] = 3;
				closePopup();
				return this.id == 'openRecommendation';
			};
		}
	}
});

