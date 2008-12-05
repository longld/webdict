<?php
//-----------------------------------------------------------------
//  Webdict for VnOSS
//  Data from HND (http://www.informatik.uni-leipzig.de/~duc/Dict/)
//
//  Author: vnpenguin@gmail.com
//  Date: Sun Jan  8 17:40:22 CET 2006
//-----------------------------------------------------------------
define(VERSION,'0.5');
$DICT = array(
	"en_vi" => "Anh - Việt",
	"vi_en" => "Việt - Anh",
	"fr_vi" => "Pháp - Việt",
	"vi_fr" => "Việt - Pháp",
	"de_vi" => "Đức - Việt",
	"vi_de" => "Việt - Đức",
	"no_vi" => "Nauy - Việt",
	"vi_vi" => "Việt - Việt",
	"ru_vi" => "Nga - Việt"
);
function _Addslashes($str){
   $str = str_replace('\\', '\\\\', $str);
   $str = str_replace('\'', '\'\'', $str);
   return $str;
}

function vicinityLinks($id){
	global $db, $dict;
	$alinks = array(); 
	$url = $_SERVER['PHP_SELF'].'?dict='.$dict.'&id=';
	$min = $id - 5; $min = ($min<0)?0:$min;
	$max = $id + 5;
	$query = "SELECT d_id,d_word FROM $dict WHERE (d_id>=$min AND d_id<=$max)";
	$res = mysql_query($query,$db);
	if($res){
		while($row  = mysql_fetch_assoc($res)){
			$alinks[] = '<a href="'.$url.$row['d_id'].'">'.$row['d_word'].'</a>';
		}
	}
	$links = implode('&nbsp;|&nbsp;',$alinks);
	return $links;
}

//-------------------------------------
// HTML output (default)
//-------------------------------------
function fmtHTML($row){
	global $dict;
	$url = 'admin.php?dict='.$dict.'&action=';
	$content = preg_split("/\r?\n/",$row['d_meanings']);
	if(!$row['d_word']){ return '';}
	$out  = '<div class="word"><table width="100%"><tr><td class="thisword" width="100" nowrap>'.$row['d_word'].'</td>';
	if($row['d_phonetic'])
		$out .= '<td class="phonetic" width="100" nowrap>/'.$row['d_phonetic'].'/</td>';
	$out .= '<td align="right" class="actions"><a href="'.$url.'edit&id='.$row['d_id'].'">Sửa</a>&nbsp;'.
		'<a href="'.$url.'add&id=&">Thêm</a></td></tr></table></div>'."\n";
	$out .= '<div class="meanings">'."\n";
	foreach ($content as $line){
		if(preg_match("/\* (.+)\s*$/",$line,$matches))
			$line = '&loz; <span class="kind">'.$matches[1].'</span>'."\n";
		elseif (preg_match("/\- (.+)\s*$/",$line,$matches))
			$line = '&nbsp;&nbsp;&bull; <span class="mean1">'.$matches[1]."</span>\n";
		elseif (preg_match("/!(.+)\s*$/",$line,$matches))
			$line = '&nbsp;&nbsp;&spades; <span class="mean2">'.$matches[1]."</span>\n";
		elseif(preg_match("/^=(.+)\+\s*(.+)\s*$/",$line,$matches)){
			$line = '&nbsp;&nbsp;&nbsp;&nbsp;&sdot; <span class="lang1">'.$matches[1].'</span> &rArr; '.
					'<span class="lang2">'.$matches[2]."</span>\n";
		}
		$out .= $line ."<br />\n";
	}
	return $out."<br /></div>\n";
}
// Output list of words
function fmtHTML2($res){
	global $dict,$fmt;
	$url = $_SERVER['PHP_SELF'].'?dict='.$dict.'&id=';
	$out = '<table><tr><td><ul class="wordlist">'."\n";
	$i=0;
	while($row  = mysql_fetch_assoc($res)){
		$i++;
		$out .= '<li><a href="'.$url.$row['d_id'].'" class="wordlink">'.$row['d_word'].'</a></li>'."\n";
		if($i%10==0){
			$out .= '</ul></td><td><ul class="wordlist">';
		}
	}
	$out .= "</ul></td></tr></table>\n";
	return $out;
}
//-------------------------------
// Output plain text
//-------------------------------
function fmtTXT($row){
	$out  = $row['d_word'].' ';
	if($row['d_phonetic'])
		$out .= '/'.$row['d_phonetic'].'/';
	$out .= "\n".$row['d_meanings']."\n";
	return $out;
}
function Select_Dict($dict='en_vi'){
	global $DICT;
	$out = '<select name="dict" size="1" onChange="showDictName(this)">';
	foreach ($DICT as $k => $v){
		$sel = ($dict==$k)?' selected':'';
		$out .= '<option value="'.$k.'"'.$sel.'>'.$v.'</option>'."\n";
	}
	$out .= '</select>'."\n";
	return $out;
}
function Select_Fmt($fmt='html'){
	$fmts = array(
		"html" => "HTML",
		"txt" => "TXT",
		"xml" => "XML",
		"context" => "ConTeXt",
		"latex" => "LaTeX"
	);
	$out = '<select name="fmt" size="1">';
	foreach ($fmts as $k => $v){
		$sel = ($fmt==$k)?' selected':'';
		$out .= '<option value="'.$k.'"'.$sel.'>'.$v.'</option>'."\n";
	}
	$out .= '</select>'."\n";
	return $out;
}
function jsVarDict($dict){
	$dict = $dict?$dict:'en_vi';
	echo '<script type="text/javascript">';
	echo 'dict="'.$dict.'";';
	echo '</script>';
}
?>
