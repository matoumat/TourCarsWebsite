/*
XMLHttpRequest:
https://en.wikipedia.org/wiki/XMLHttpRequest

CouchDB:
http://guide.couchdb.org/draft/tour.html
https://wiki.apache.org/couchdb/HTTP_Document_API
http://docs.couchdb.org/en/1.6.1/config/intro.html
http://docs.couchdb.org/en/1.6.1/config/http.html#cross-origin-resource-sharing
http://docs.couchdb.org/en/1.6.1/intro/curl.html

HTML(5):
http://www.w3schools.com/html/default.asp
http://www.w3schools.com/jsref/default.asp

CouchDB configuration (Mac OS X):
~/Library/Application Support/CouchDB/etc/couchdb/local.ini
/Applications/Apache CouchDB.app/Contents/Resources/couchdbx-core/etc/couchdb/local.ini
CouchDB configuration (Windows):
C:\Program Files (x86)\Apache Software Foundation\CouchDB\etc\couchdb\local.ini
start/stop/restart: Control Panel --> Services --> Apache CouchDB

[httpd]
enable_cors = true
bind_address = 0.0.0.0  <-- for access from other devices, 127.0.0.1: local device only
...

[cors]
origins = *

*/

var request = new XMLHttpRequest();

request.onreadystatechange = function() {
	// console.log("onreadystatechange: " + request.readyState + ", " +  request.status);
	// console.log(request.responseText);
	if (request.readyState == 4) {
		if (request.status == 200) {
			var response = JSON.parse(request.responseText);
			handlers[response._id](response);
		}
		if (request.status == 404) {
			console.log("not found: " + request.responseText);
		}
	}
};

function get(variable) {
	// console.log("get " + variable);
	request.open("GET", dburl + variable, false);
	request.send();
}

function put(response, message) {
	request.open("PUT", dburl + response._id, false);
	request.setRequestHeader("Content-type", "application/json");
	message["_id"] = response._id;
	if (response._rev) {
		message["_rev"] = response._rev;
	}
	var s = JSON.stringify(message);
	// console.log("put: " + s);
	request.send(s);
}

function update() {
	for (var name in handlers) {
		// console.log("updating " + name);
		get(name);
	}
}

// request updates with a fixed interval (ms)
var intervalID = setInterval(update, 200);

///////////////////////////////////////////////////////////////////////////////
// your code below

var dbname = "hci1";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var handlers = {
	"innerText" : updateInnerText,
	"valueAttribute" : updateValueAttribute,
	"page" : updatePage,
	"popup" : updatePopup
	// add further handlers here
};

function updateAnimal(response) {
	document.getElementById(response._id).src = response.src;
	document.getElementById(response._id).width = response.width;
}

function updateCounter(response) {
	document.getElementById(response._id).innerHTML =
		showCounter ? response.value : "";
}

var showCounter = true;

function showCounter(response) {
	showCounter = response.checked;
}

function updateInnerText(response) {
	if ((document.getElementById(response.elid) != null) && (document.getElementById(response.elid)!='')) {
		document.getElementById(response.elid).innerHTML = response.value;
	}
}

function updateValueAttribute(response) {
	if ((document.getElementById(response.elid) != null) && (document.getElementById(response.elid)!='')) {
		document.getElementById(response.elid).value = response.value;
	}
}

function updatePage(response) {
	if (!response.received) {
		put(response, {'received' : true});
		$(location).attr('href', response.value);
	}
}

function updatePopup(response) {
	if ((response.value !== "") && (!response.received)) {
		$(response.value).dialog();
		put(response, {'received' : true});
	}
}
