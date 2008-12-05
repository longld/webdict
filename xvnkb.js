/*----------------------------------------------------------------------------*/
/*  xvnkb.js - a.k.a CHIM - CHuoi's Input Method                              */
/*----------------------------------------------------------------------------*/
/*  copyright         : (C) 2005 by Dao Hai Lam                               */
/*  website           : http://xvnkb.sf.net                                   */
/*  email             : daohailam<at>yahoo<dot>com                            */
/*  last modify       : Tue, 24 May 2005 21:18:04 +0700                       */
/*  version           : 0.8                                                   */
/*----------------------------------------------------------------------------*/
/*                                                                            */
/*   This program is free software; you can redistribute it and/or modify     */
/*   it under the terms of the GNU General Public License as published by     */
/*   the Free Software Foundation; either version 2 of the License, or        */
/*   (at your option) any later version.                                      */
/*                                                                            */
/*----------------------------------------------------------------------------*/
var chr_A = 'A';
var chr_a = 'a';
var chr_U = 'U';
var chr_u = 'u';
var chr_G = 'G';
var chr_g = 'g';
var chr_Q = 'Q';
var chr_q = 'q';
var chr_0x80 = String.fromCharCode(0x80);
/*----------------------------------------------------------------------------*/
var vowels = "AIUEOYaiueoy";
var consonants = "BCDFGHJKLMNPQRSTVWXZbcdfghjklmnpqrstvwxz";
/*----------------------------------------------------------------------------*/
var vnBuffer = "";
var needUpdateBuffer = false;
var tempOff = 0;
/*----------------------------------------------------------------------------*/
var vnMethod = 2;
/*----------------------------------------------------------------------------*/
function VKCharIsUI(u)
{
	var n;
	u = u.charCodeAt(0);
	for ( n = 0; UI[n] != 0 && UI[n] != u; n++ );
	return UI[n] != 0 ? n : -1;
}
/*----------------------------------------------------------------------------*/
function VKCharPriorityCompare(u1, u2)
{
	var n, i = -1, j = -1, u;
	for ( n = 0, u = u1.charCodeAt(0); VN[n] != 0 && VN[n] != u; n++ );
	if ( VN[n] != 0 ) i = n;
	for ( n = 0, u = u2.charCodeAt(0); VN[n] != 0 && VN[n] != u; n++ );
	if ( VN[n] ) j = n;
	return i - j;
}
/*----------------------------------------------------------------------------*/
function VKSetCharAt( n, c )
{
	vnBuffer = vnBuffer.substring( 0, n ) +
		String.fromCharCode( c ) + vnBuffer.substring( n + 1 );
}
/*----------------------------------------------------------------------------*/
var SPELL_CHECKING = {
	enabled: true, // checking status
	powels: [],    // list of previous vowel positions
	vowels: [],    // list of vowels
	position: 0,   // position of last vowel
	count: 0       // number of vowels in list
};
/*----------------------------------------------------------------------------*/
var vp = 0;
var vpc = 0;
var vps = new Array();
var lvs = new Array();
var spellChecking = true;
/*----------------------------------------------------------------------------*/
function VKAppend(count, lastkey, key)
{
	var spchk = "AIUEOYaiueoy|BDFJKLQSVWXZbdfjklqsvwxz|'`~?.^*+=";
	var vwchk = "|ia|ua|oa|ai|ui|oi|au|iu|eu|ie|ue|oe|ye|ao|uo|eo|ay|uy|uu|ou|io|";
	var nvchk = "FfJjWwZz";

	if( spellChecking && !tempOff ) {
		var kp = spchk.indexOf(key);

		if ( !count ) {
			if ( nvchk.indexOf(key) >= 0 )
				tempOff = -1;
			else
			if ( kp >= 0 && kp < 12 ) {
				vpc = 1;
				vps[vp = 0] = -1;
				lvs[0] = key;
			}
			else
			if( kp == 12 || kp > 37 )
				return;
			else {
				vp = -1;
				vpc = 0;
			}
		}
		else
		if( kp == 12 || kp > 37 ) {
			VKClearBuffer();
			return;
		}
		else
		if( kp > 12 ) // b, d, f,...
			tempOff = count;
		else
		if( kp >= 0 ) { // vowels
			if( vp < 0 ) {
				vps[vpc++] = vp;
				vp = count;
				lvs[0] = key;
			}
			else
			if( count - vp > 1 )
				tempOff = count;
			else {
				var w = "|"+lvs[vpc-1].toLowerCase()+key.toLowerCase()+"|";
				if ( vwchk.indexOf(w) < 0 )
					tempOff = count;
				else {
					lvs[vpc] = key;
					vps[vpc++] = vp;
					vp = count;
				}
			}
		}
		else
		switch( key ) {
			case 'h':
			case 'H': // [cgknpt]h
				if( lastkey >= chr_0x80 || "CGKNPTcgknpt".indexOf(lastkey) < 0 )
					tempOff = count;
				break;
			case 'g':
			case 'G': // [n]g
				if( lastkey != 'n' && lastkey != 'N' )
					tempOff = count;
				break;
			case 'r':
			case 'R': // [t]r
				if( lastkey != 't' && lastkey != 'T' )
					tempOff = count;
				break;
			default:
				if( consonants.indexOf(lastkey) >= 0 )
					tempOff = count;
				break;
		}
	}
	vnBuffer += key;
}
/*----------------------------------------------------------------------------*/
function VKAddKey( key )
{
	var p = -1;
	var i, j = -1;
	var b, c = 0, cc, l;
	var count = vnBuffer.length;
	var m = modes[ vnMethod-1 ], n;
	var v = null;

	if( !count || tempOff != 0 ) {
		VKAppend(0, 0, key);
		return -1;
	}

	b = vnBuffer.split("");
	c = b[p = count - 1];
	n = key.toLowerCase();
	for( i = 1; i < m.length; i++ )
		if( m[i].indexOf(n) >= 0 ) break;
	if( i >= m.length ) {
		VKAppend(count, c, key);
		return -1;
	}

	switch( l = i ) {
		case 1:
			break;
		case 2:
		default:
			i = p;
			while( i >= 0 && b[i] < chr_0x80 && vowels.indexOf(b[i]) < 0 ) i--;
			if( i < 0 ) {
				VKAppend(count, c, key);
				return -1;
			}

			while( i >= 0 && b[i] < chr_0x80 && vowels.indexOf(b[i]) < 0 ) i--;
			while( i-1 >= 0 &&
				(vowels.indexOf(b[i-1]) >=0 || b[i-1] > chr_0x80) &&
				VKCharPriorityCompare( b[i-1], b[i] ) < 0 ) i--;
			if( i == count-1 && i-1 >= 0 &&	(j = VKCharIsUI(b[i-1])) > 0 )
			switch( b[i] ) {
				case chr_a:
				case chr_A:
					if( i-2 < 0 ||
						(j < 24 && b[i-2] != chr_q && b[i-2] != chr_Q) ||
						(j >= 24 && b[i-2] != chr_g && b[i-2] != chr_G) )
						i = i - 1;
					break;
				case chr_u:
				case chr_U:
					if( i-2 < 0 || (b[i-2] != chr_g && b[i-2] != chr_G) )
						i = i - 1;
					break;
			}
			c = b[p = i];
			break;
	}

	var x = c.charCodeAt(0);
	var found = false;
	if( l == 1 ) {
		m = m[0];
		for( i = 0; !found && i < m.length; i++ ) {
			var k = m[i];
			if( k[0] == n ) {
				for( i = 1; i < k.length; i++ ) {
					v = vncode_1[k[i]];
					for( j = 0; j < v.length; j++ )
						if( v[j] == x ) {
							if( j % 2 == 0 )
								VKSetCharAt( p, v[j+1] );
							else {
								VKSetCharAt( p, v[j-1] );
								tempOff = count + 1;
								vnBuffer += key;
							}
							// breakout
							found = true;
							i = k.length;
							break;
						}
				}
				break;
			}
		}
	}
	else {
		for( i = 0; i < vncode_2.length; i++ ) {
			v = vncode_2[i];
			for( j = 0; j < v.length; j++ )
				if( v[j] == x ) {
					i = m[2].indexOf(n);
					if( i >= 0 ) {
						if( i != j )
							VKSetCharAt( p, v[i] );
						else {
							VKSetCharAt( p, v[0] );
							tempOff = count + 1;
							vnBuffer += key;
						}
						found = true;
					}
					j = v.length;
					i = vncode_2.length;
				}
		}
	}
	if( !found ) {
		VKAppend(count, c, key);
		return -1;
	}

	return p;
}
/*----------------------------------------------------------------------------*/
function VKBackSpace()
{
	var count = vnBuffer.length;
	if( count <= 0 )
		needUpdateBuffer = true;
	else {
		vnBuffer = vnBuffer.substring( 0, --count );
		if( count == vp ) vp = vps[--vpc];
		if( (tempOff < 0 && !count) || (count <= tempOff) ) tempOff = 0;
	}
}
/*----------------------------------------------------------------------------*/
function VKClearBuffer()
{
	vnBuffer = "";
	tempOff = 0;
	vpc = 0;
	vp = -1;
}
/*----------------------------------------------------------------------------*/
function VKSetDisplay()
{
	if ( typeof(DISPLAY_ID) != "undefined" && vnMethod < DISPLAY_ID.length ) {
		var r = document.getElementById( DISPLAY_ID[vnMethod] );
		if ( r ) r.checked = true;
	}
	if ( typeof(SPELLCHECK_ID) != "undefined" ) {
		var r = document.getElementById( SPELLCHECK_ID );
		if ( r ) r.checked = spellChecking;
	}
}
/*----------------------------------------------------------------------------*/
function VKSwitchMethod()
{
	VKClearBuffer();
	vnMethod = (++vnMethod & 3);
	VKSetDisplay();
}
/*----------------------------------------------------------------------------*/
function VKSetMethod(m)
{
	VKClearBuffer();
	vnMethod = (m & 3);
	VKSetDisplay();
}
/*----------------------------------------------------------------------------*/
function VKTestMethod(text)
{
	for ( i = 0; i < text.length; i++ )
		VKAddKey( text.charAt(i) );
	alert(vnBuffer);
}
/*----------------------------------------------------------------------------*/
function VKSetSpellcheck(s)
{
	spellChecking = s;
}
/*----------------------------------------------------------------------------*/
function VKSwitchSpellcheck()
{
	spellChecking = !spellChecking;
}
/*----------------------------------------------------------------------------*/
function VKGetTarget(e)
{
	if ( e == null )
		e = window.event;
	if ( e == null )
		return null;
	if ( e.srcElement != null ) // IE
		return e.srcElement;
	var r = e.target;
	while ( r && r.nodeType != 1 ) // climb up from text nodes on Moz
		r = r.parentNode;
	return r;
}
/*----------------------------------------------------------------------------*/
function VKGetCursorPosition( target )
{
	if ( target == null )
		return -1;
	// empty control means the cursor is at 0
	if ( target.value == null || target.value.length == 0 )
		return -1;
	// -1 for unknown
	var cursorIndex = -1;
	if ( target.createTextRange ) {
		var selection = window.document.selection.createRange();
		var textRange = target.createTextRange();
		// if the current selection is within the edit control			
		if (textRange == null || selection == null ||
			(( selection.text != "" ) && textRange.inRange(selection) == false) )
			return -1;
		if (selection.text == "") {
			if ( target.tagName == "INPUT" ) {
				var contents = textRange.text;
				var index = 1;
				while (index < contents.length) {
					textRange.findText(contents.substring(index));
					if (textRange.boundingLeft == selection.boundingLeft)
						break;
					index++;
				}
			}
			// Handle text areas.
			else if ( target.tagName == "TEXTAREA" ) {
				var index = target.value.length + 1;
				var theCaret = document.selection.createRange().duplicate();
				while ( theCaret.parentElement() == target &&
					theCaret.move("character", 1) == 1 ) {
					--index;
					if (target.value.charCodeAt(index) == 10)
						index -= 1;
				}
				if ( index == target.value.length + 1 )
					index = -1;
			}
			cursorIndex = index;
		}
		else {
			cursorIndex = textRange.text.indexOf(selection.text);
		}
	}
	// Moz
	else if ( window.getSelection && window.document.createRange ) {
		if ( target.selectionStart < 0 || target.selectionStart > target.length )
			return cursorIndex;

		if ( target.selectionEnd < 0 || target.selectionEnd > target.length ||
		     target.selectionEnd < target.selectionStart )
			return cursorIndex;

		cursorIndex = target.selectionStart;
	}
	// Safari
	else {
	}
	return cursorIndex;
}
/*----------------------------------------------------------------------------*/
function VKSetCursorPosition(target, p)
{
	if ( p < 0 ) return;
	if ( !target.createTextRange )
		target.selectionStart = target.selectionEnd = p;
	else {
		var n = p;
		while ( n >= 0 ) {
			if ( target.value.charCodeAt(n) == 10 )
				p = p - 1;
			n = n - 1;
		}
		var r = target.createTextRange();
		r.moveStart('character', p);
		r.collapse();
		r.select();
	}
}
/*----------------------------------------------------------------------------*/
function VKUpdateBuffer(target)
{
	var separators = "\ !\@#\$%\^\&*()_+=-{}[]|\\:\";\'<>?,./~\`\r\n\t";
	var c = VKGetCursorPosition( target ) - 1;
	VKClearBuffer();
	if ( c > 0 ) {
		while ( c >= 0 && separators.indexOf(target.value.charAt(c)) < 0 ) {
			vnBuffer = target.value.charAt(c) + vnBuffer;
			c = c - 1;
		}
	}
	needUpdateBuffer = false;
}
/*----------------------------------------------------------------------------*/
var NOOP = ["f_password", "f_number", "f_english"];
/*----------------------------------------------------------------------------*/
var VK_TAB = 9;
var VK_BACKSPACE = 8;
var VK_ENTER = 13;
var VK_DELETE = 46;
var VK_SPACE = 32;
var VK_LIMIT = 128
var VK_LEFT_ARROW = 37;
var VK_RIGHT_ARROW = 39;
var VK_HOME = 36;
var VK_END = 35;
var VK_PAGE_UP = 33;
var VK_PAGE_DOWN = 34;
var VK_UP_ARROW = 38;
var VK_DOWN_ARROW = 40;
var VK_HOTKEY = 'z'.charCodeAt(0);
/*----------------------------------------------------------------------------*/
function VKProcessControlKey(keyCode)
{
	switch ( keyCode ) {
		case VK_TAB:
		case VK_ENTER:
			VKClearBuffer();
			break;
		case VK_BACKSPACE:
			VKBackSpace();
			break;
		case VK_DELETE:
		case VK_LEFT_ARROW:
		case VK_RIGHT_ARROW:
		case VK_HOME:
		case VK_END:
		case VK_PAGE_UP:
		case VK_PAGE_DOWN:
		case VK_UP_ARROW:
		case VK_DOWN_ARROW:
			needUpdateBuffer = true;
			break;
	}
}
/*----------------------------------------------------------------------------*/
function VKIsHotkey(e, k)
{
	if (e.altKey || e.altLeft) {
		if ( k == VK_HOTKEY )
			VKSwitchMethod();
		return true;
	}
	return false;
}
/*----------------------------------------------------------------------------*/
function VKKeyHandler(e)
{
	if ( e == null ) e = window.event;

	var keyCode = e.keyCode;
	if ( keyCode == 0 ) // as it might on Moz
		keyCode = e.charCode;
	if ( keyCode == 0 ) // unlikely to get here
		keyCode = e.which;
	if ( VKIsHotkey(e, keyCode) )
		return;

	if ( !vnMethod ) return;

	var target = null;
	if ( !(target = VKGetTarget(e)) ) return;
	if ( target.type != 'textarea' && target.type != 'text' ) return;
	if ( e.ctrlKey || e.ctrlLeft || e.metaKey ) return;
	for ( i = 0; i < NOOP.length; i++ )
		if( NOOP[i].length > 0 && target.id == NOOP[i] ) return;

	if ( e.charCode == null || e.charCode != 0 ) { // process ASCII only
		if ( keyCode == VK_SPACE || keyCode == VK_ENTER )
			VKClearBuffer();
		else
		if ( keyCode > VK_SPACE && keyCode < VK_LIMIT ) {
			if ( needUpdateBuffer )
				VKUpdateBuffer( target );

			var l = vnBuffer.length;
			var p = VKAddKey( String.fromCharCode(keyCode) );
			if ( p >= 0 ) {
				var c = VKGetCursorPosition( target ) - 1;
				if ( c >= 0 ) {
					var t = target.scrollTop;
					var r = c - vnBuffer.length + p + 1;
					if ( l < vnBuffer.length ) r++;
					target.value = target.value.substring( 0, r ) +
						vnBuffer.charAt(p) + target.value.substring( r + 1 );
					VKSetCursorPosition( target, c + 1 );
					target.scrollTop = t;
					if ( l < vnBuffer.length ) return;
				}
				return false;
			}
		}
		else {
			needUpdateBuffer = true;
		}
	}
	else // process control key
		VKProcessControlKey( keyCode );
}
/*----------------------------------------------------------------------------*/
function VKKeyDown(e)
{
	if ( !vnMethod ) return;

	var target = null;
	if ( e == null ) e = window.event;
	if ( !(target = VKGetTarget(e)) ) return;
	if ( target.type != 'textarea' && target.type != 'text' ) return;
	if ( e.ctrlKey || e.ctrlLeft || e.altKey || e.altLeft || e.metaKey ||
				e.shiftKey || e.shiftLetf ) return;
	for ( i = 0; i < NOOP.length; i++ )
		if( NOOP[i].length > 0 && target.id == NOOP[i] ) return;

	var keyCode = e.keyCode;
	if ( keyCode == 0 ) // as it might on Moz
		keyCode = e.charCode;

	if ( keyCode == 0 ) // unlikely to get here
		keyCode = e.which;

	VKProcessControlKey( keyCode );
}
/*----------------------------------------------------------------------------*/
function VKMouseDown(e)
{
	if ( !vnMethod ) return;

	var target = null;
	if ( e == null ) e = window.event;
	if ( !(target = VKGetTarget(e)) ) return;
	if ( target.type != 'textarea' && target.type != 'text' ) return;
	needUpdateBuffer = true;
}
/*----------------------------------------------------------------------------*/
/* Initialization                                                             */
/*----------------------------------------------------------------------------*/
var agent = navigator.userAgent.toLowerCase();
var isIE = agent.indexOf("msie") != -1 && agent.indexOf("opera") == -1;
/*----------------------------------------------------------------------------*/
if ( isIE ) document.onkeydown = VKKeyDown;
document.onkeypress = VKKeyHandler;
document.onmousedown = VKMouseDown;
/*----------------------------------------------------------------------------*/
/* Code tables                                                                */
/*----------------------------------------------------------------------------*/
var vn_A0=[65,193,192,7842,195,7840];
var vn_a0=[97,225,224,7843,227,7841];
var vn_A6=[194,7844,7846,7848,7850,7852];
var vn_a6=[226,7845,7847,7849,7851,7853];
var vn_A8=[258,7854,7856,7858,7860,7862];
var vn_a8=[259,7855,7857,7859,7861,7863];
var vn_O0=[79,211,210,7886,213,7884];
var vn_o0=[111,243,242,7887,245,7885];
var vn_O6=[212,7888,7890,7892,7894,7896];
var vn_o6=[244,7889,7891,7893,7895,7897];
var vn_O7=[416,7898,7900,7902,7904,7906];
var vn_o7=[417,7899,7901,7903,7905,7907];
var vn_U0=[85,218,217,7910,360,7908];
var vn_u0=[117,250,249,7911,361,7909];
var vn_U7=[431,7912,7914,7916,7918,7920];
var vn_u7=[432,7913,7915,7917,7919,7921];
var vn_E0=[69,201,200,7866,7868,7864];
var vn_e0=[101,233,232,7867,7869,7865];
var vn_E6=[202,7870,7872,7874,7876,7878];
var vn_e6=[234,7871,7873,7875,7877,7879];
var vn_I0=[73,205,204,7880,296,7882];
var vn_i0=[105,237,236,7881,297,7883];
var vn_Y0=[89,221,7922,7926,7928,7924];
var vn_y0=[121,253,7923,7927,7929,7925];
/*----------------------------------------------------------------------------*/
var vncode_2=
[	vn_A0,vn_a0,vn_A6,vn_a6,vn_A8,vn_a8,
	vn_O0,vn_o0,vn_O6,vn_o6,vn_O7,vn_o7,
	vn_U0,vn_u0,vn_U7,vn_u7,
	vn_E0,vn_e0,vn_E6,vn_e6,
	vn_I0,vn_i0,vn_Y0,vn_y0
];
/*----------------------------------------------------------------------------*/
var vn_AA=[65,194,193,7844,192,7846,7842,7848,195,7850,7840,7852,258,194,7854,7844,7856,7846,7858,7848,7860,7850,7862,7852,97,226,225,7845,224,7847,7843,7849,227,7851,7841,7853,259,226,7855,7845,7857,7847,7859,7849,7861,7851,7863,7853];
var vn_AW=[65,258,193,7854,192,7856,7842,7858,195,7860,7840,7862,194,258,7844,7854,7846,7856,7848,7858,7850,7860,7852,7862,97,259,225,7855,224,7857,7843,7859,227,7861,7841,7863,226,259,7845,7855,7847,7857,7849,7859,7851,7861,7853,7863];
/*----------------------------------------------------------------------------*/
var vn_OO=[79,212,211,7888,210,7890,7886,7892,213,7894,7884,7896,416,212,7898,7888,7900,7900,7902,7892,7904,7894,7906,7896,111,244,243,7889,242,7891,7887,7893,245,7895,7885,7897,417,244,7899,7889,7901,7891,7903,7893,7905,7895,7907,7897];
var vn_OW=[79,416,211,7898,210,7900,7886,7902,213,7904,7884,7906,212,416,7888,7898,7890,7900,7892,7902,7894,7904,7896,7906,111,417,243,7899,242,7901,7887,7903,245,7905,7885,7907,244,417,7889,7899,7891,7901,7893,7903,7895,7905,7897,7907];
var vn_UW=[85,431,218,7912,217,7914,7910,7916,360,7918,7908,7920,117,432,250,7913,249,7915,7911,7917,361,7919,7909,7921];
var vn_EE=[69,202,201,7870,200,7872,7866,7874,7868,7876,7864,7878,101,234,233,7871,232,7873,7867,7875,7869,7877,7865,7879];
var vn_DD=[68,272,100,273];
/*----------------------------------------------------------------------------*/
var vncode_1=[vn_AA,vn_EE,vn_OO,vn_AW,vn_OW,vn_UW,vn_DD];
var telex=[['a',0],['e',1],['o',2],['w',3,4,5],['d',6]];
var vni=[['6',0,1,2],['7',4,5],['8',3],['9',6]];
var viqr=[['^',0,1,2],['+',4,5],['(',3],['d',6]];
/*----------------------------------------------------------------------------*/
var modes=[
[vni,'6789','0123456'],
[telex,'adeow','zsfrxj'],
[viqr,'^+(d',"='`?~."]
];
/*----------------------------------------------------------------------------*/
var UI=[85,218,217,7910,360,7908,117,250,249,7911,361,7909,431,7912,7914,7916,7918,7920,432,7913,7915,7917,7919,7921,73,205,204,7880,296,7882,105,237,236,7881,297,7883,0];
var VN=[97,65,225,193,224,192,7843,7842,227,195,7841,7840,226,194,7845,7844,7847,7846,7849,7848,7851,7850,7853,7852,259,258,7855,7854,7857,7856,7859,7858,7861,7860,7863,7862,101,69,233,201,232,200,7867,7866,7869,7868,7865,7864,234,202,7871,7870,7873,7872,7875,7874,7877,7876,7879,7878,111,79,243,211,242,210,7887,7886,245,213,7885,7884,244,212,7889,7888,7891,7890,7893,7892,7895,7894,7897,7896,417,416,7899,7898,7901,7900,7903,7902,7905,7904,7907,7906,121,89,253,221,7923,7922,7927,7926,7929,7928,7925,7924,117,85,250,218,249,217,7911,7910,361,360,7909,7908,432,431,7913,7912,7915,7914,7917,7916,7919,7918,7921,7920,105,73,237,205,236,204,7881,7880,297,296,7883,7882,273,272,0];
