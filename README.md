JavaScript Errors Notifier
==========================

## Installation

Add [JavaScript Errors Notifier](https://chrome.google.com/webstore/detail/javascript-errors-notifie/jafmfknfnkoekkdocjiaipcnmkklaajd) extension to your Google Chrome, and check [the test page](http://php-console.com/js_errors.html) to see how JavaScript errors will be handled in your browser.

## Features

* When a JavaScript error occurs, the extension icon in the toolbar turns red, and a error icon appears in the bottom-right corner of the page
* When either icon is clicked, the error's details are shown, including a stack trace with source files and row and column positions
* Clicking the error's source location opens the view-source page
* Clicking the error's text searches StackOverflow
* Clicking the copy button copies error details to the clipboard
* Does not remove user-defined error handlers
* Handles console.error() calls
* Handles missing js/css/other missing files 404 errors
* Ignores 404 errors initiated by AdBlock, etc
* Ignores repeated errors
* Ignores Google Chrome extensions' internal errors

## Contribution

* Check [Issues](https://github.com/barbushin/javascript-errors-notifier/issues) page for feature requests.
* Please keep original code style: use `tab` for indention, and all other spacing & braces formatting same as in original.
* Test your code twice :) Thank you!

## Recommended

Google Chrome extension [PHP Console](https://chrome.google.com/webstore/detail/php-console/nfhmhhlpfleoednkpnnnkolmclajemef)
