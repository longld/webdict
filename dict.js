//---------------------------------------------------
//Oroginal version of Julian Robichaux(http://www.nsftools.com/tips/ZipLookupTest.htm)
// Modified by vnpenguin@gmail.com for VnOSS webdict
//---------------------------------------------------
var queryField;
var lookupURL = 'http://vnoss.net/dict/dict.php';
//var lookupURL = 'http://localhost/dict/dict.php';
var max;
var divID;
var dictID='dictName';
var dictTitle;
var xmlHttp;
var cache = new Object();
var globalDiv;
var divFormatted = false;
var DIV_BG_COLOR = '#ffffff';
var DIV_HIGHLIGHT_COLOR = '#3366cc';
var FONT_COLOR = '#000000';
var FONT_HOVER_COLOR = '#ffffff';

function InitQuery (_fID,_dID,_max) {
  	queryField = document.getElementById(_fID);
  	queryField.onkeydown = keypressHandler;
  	queryField.focus();
  	divID = _dID;
	max = _max ? _max : 20;
  	addToCache("", new Array());
	dictTitle = document.getElementById(dictID);
}

function addToCache (queryStr, resArr) {
	cache[queryStr] = new Array(resArr);
}

function getDiv(ID) {
	if(!globalDiv){
		globalDiv = document.getElementById(ID);
		if(!divFormatted){
			globalDiv.style.backgroundColor = DIV_BG_COLOR;
			globalDiv.style.fontFamily = 'Verdana,Arial';
			globalDiv.style.fontSize = '12px';
			globalDiv.style.visibility = 'hidden';
			globalDiv.style.zIndex = 10000;
			divFormatted = true;
		}
	}
	return globalDiv;
}

function showACDiv (queryStr, dictName, resArr) {
	var div  = getDiv(divID);
	//var span = document.getElementById(dictID);
	dictTitle.innerHTML = '&nbsp;&rArr;&nbsp;['+dictName+']';
	dictTitle.style.color = 'blue';
  	while (div.childNodes.length > 0)
    	div.removeChild(div.childNodes[0]);
		
  	for (var i = 0; i < resArr.length; i++) {
    	// each result will be contained within its own div
    	var res = document.createElement("div");
    	res.style.cursor = "pointer";
    	//res.style.borderBottom = "1px solid #000000";
    	res.style.padding = "0px 3px 0px 3px";
  		res.style.backgroundColor = DIV_BG_COLOR;
  		res.style.color = FONT_COLOR;
    	res.onmousedown = selRes;
    	res.onmouseover = hiliRes;
    	res.onmouseout  = unhiliRes;
    	res.innerHTML   = resArr[i];
    	div.appendChild(res);
  	}
  
  	var isCached = cache[queryStr];
  	if (!isCached)
    	addToCache(queryStr, resArr);
  	showDiv(resArr.length > 0);
}

function selRes() { _selRes(this); }

function _selRes(item) {
	queryField.value = item.innerHTML;
	queryField.focus();
	showDiv(false);
    return;
}

function hiliRes()   { _hiliRes(this); }
function unhiliRes() { _unhiliRes(this); }

function _hiliRes(item) {
	item.style.backgroundColor = DIV_HIGHLIGHT_COLOR;
  	item.style.color= FONT_HOVER_COLOR;
}

function _unhiliRes(item) {
  	item.style.backgroundColor = DIV_BG_COLOR;
  	item.style.color= FONT_COLOR;
}

function showDiv (show) {
	var div = getDiv(divID);
  	if (show){
    	div.style.visibility = 'visible';
		div.className = 'box';
  	} else {
    	div.style.visibility = 'hidden';
		div.className = 'boxhidden';
	}
}

function getXMLHTTP(){
  	var A = null;
  	try{
    	A = new ActiveXObject("Msxml2.XMLHTTP");
  	}catch(e){
    	try{
      		A = new ActiveXObject("Microsoft.XMLHTTP");
    	} catch(oc){
      		A = null;
    	}
  	}
  	if(!A && typeof XMLHttpRequest != "undefined")
  		A = new XMLHttpRequest();
  	return A;
}

function doRemoteQuery (queryStr) {
  	var _url = lookupURL+'?d='+dict+'&q='+queryStr+'&max='+max+'&fmt=js';
  	if(xmlHttp && xmlHttp.readyState != 0) { xmlHttp.abort() }
  
	xmlHttp=getXMLHTTP();
  	if(xmlHttp){
    	xmlHttp.open("GET",_url, true);
    	// What do we do when the response comes back?
    	xmlHttp.onreadystatechange = function() {
      		if (xmlHttp.readyState == 4 && xmlHttp.responseText) {
        		eval(xmlHttp.responseText);
      		}
    	};
    	xmlHttp.send(null);
  	}
}

function keypressHandler (evt) {
  	// don't do anything if the div is hidden
  	var div = getDiv(divID);
	//var div = document.getElementById(divID);
  	if (div.style.visibility == "hidden") 
		return true;
  
  	// make sure we have a valid event variable
	if(!evt && window.event) {
    	evt = window.event;
  	}
  	var key = evt.keyCode;
  
  	// if this key isn't one of the ones we care about, just return
	var KEYUP = 38;
  	var KEYDOWN = 40;
  	var KEYENTER = 13;
  	var KEYTAB = 9;
  
  	if ((key != KEYUP) && (key != KEYDOWN) && (key != KEYENTER) && (key != KEYTAB))
    	return true;
  
  	// get the span that's currently selected, and perform an appropriate action
  	var selNum = getSelectedSpanNum(div);
  	var selSpan = setSelectedSpan(div, selNum);
  
  	if ((key == KEYENTER) || (key == KEYTAB)) {
    	if (selSpan)
      		_selRes(selSpan);
    	evt.cancelBubble=true;
    	return false;
  	} else {
    	if (key == KEYUP)
      		selSpan = setSelectedSpan(div, selNum - 1);
    	if (key == KEYDOWN)
      		selSpan = setSelectedSpan(div, selNum + 1);
    	if (selSpan)
      		_hiliRes(selSpan);
  	}
  
  	showDiv(true);
  	return true;
}

function getSelectedSpanNum (div) {
  	var count = -1;
  	var spans = div.getElementsByTagName("div");
  	if (spans) {
    	for (var i = 0; i < spans.length; i++) {
      		count++;
      		if (spans[i].style.backgroundColor != div.style.backgroundColor)
        		return count;
    	}
  	}
	return -1;
}

function setSelectedSpan (div, spanNum) {
	//var count = -1;
  	var thisSpan;
  	var spans = div.getElementsByTagName("div");
  	if (spans) {
    	for (var i = 0; i < spans.length; i++) {
      		//if (++count == spanNum) {
      		if (i == spanNum) {
        		_hiliRes(spans[i]);
        		thisSpan = spans[i];
      		} else {
        		_unhiliRes(spans[i]);
      		}
    	}
  	}
  	return thisSpan;
}

function showDictName(t){
	//var dictname = t.options[t.selectedIndex].value;
	var dictName = t.options[t.selectedIndex].text;
	dict = t.options[t.selectedIndex].value;
	//var span = document.getElementById(dictID);
	dictTitle.innerHTML = '&nbsp;&rArr;&nbsp;['+dictName+']';
	dictTitle.style.color = 'blue';
}
