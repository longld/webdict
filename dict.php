<?php
//-----------------------------------------------------------------
//  Webdict for VnOSS
//  Data from HND (http://www.informatik.uni-leipzig.de/~duc/Dict/)
//
//  Author: vnpenguin@gmail.com
//  Date: Sun Jan  8 17:40:22 CET 2006
//-----------------------------------------------------------------
// dict.php?q=QUERYSTRING&d=EN_VI&max=NUM&fmt=FORMAT
//
include('dict_functions.php');
include('dict_config.php');
$db = mysql_connect($dbhost,$dbuser,$dbpass) or die('Could not connect: ' . mysql_error());
mysql_select_db($dbname) or die('Could not select database');
$query = "SET NAMES 'UTF8'";
mysql_query($query,$db);
$max=20;
//------------------------------
function return_PHP($res){
	$words = array();
	while($row = mysql_fetch_row($res)){
		$words[] = '"'.$row[0].'"';
	}
	$out = implode(",",$words);
	$out = '$ACList = Array ('.$out.');';
	return $out;
}

function return_JS($res){
	global $dict,$DICT;
	$words = array();
	while($row = mysql_fetch_row($res)){
		$words[] = '"'.$row[0].'"';
	}
	$out = implode(",",$words);
	$out = 'showACDiv("'.$_key.'", "'.$DICT[$dict].'", new Array('.$out.'));';
	return $out;
}
function return_HTML($res){
	$words = array();
	while($row = mysql_fetch_row($res)){
		$words[] = '<div class="ACList">'.$row[0].'</div>';
	}
	$out = implode("\n",$words);
	return $out;
}

function return_TXT($res,$sep){
	$words = array();
	while($row = mysql_fetch_row($res)){
		$words[] = $row[0];
	}
	$out = implode($sep,$words);
	return $out;
}

function return_XML($res){
	$words = array('<?xml version="1.0" ?>','<wordlist>');
	while($row = mysql_fetch_row($res)){
		$words[] = '<item>'.$row[0].'</item>';
	}
	$words[] = '</wordlist>';
	$out = implode("\n",$words);
	return $out;
}
//$DICTS = array ('en_vi','vi_en','fr_vi','vi_fr','de_vi','vi_de','no_vi','vi_vi','ru_vi');
//-------------------------------------------------------------------------------
if(isset($_GET['q']) && $_GET['q']!='' && isset($_GET['d'])){

	$dict = strtolower($_GET['d']);
	$fmt  = strtolower($_GET['fmt']);
	$fmt = isset($fmt) ? $fmt : 'js';
	if (isset($_GET['max'])){
		$max = $_GET['max'];
		$max = ($max<0 || $max>50)?20:$max;
	}
	$_key  = $_GET['q'];
	$key  = $_key.'%';

	//if(!in_array($dict,$DICTS) { $dict = 'en_vi'; }
	if(strlen($key)>32 OR preg_match("/\.|\/|\-\-|=/",$key)){ exit; }
	//$key = _Addslashes($key);

	$out = '';
	$query = 'SELECT d_word FROM '.$dict." WHERE d_word LIKE '$key' LIMIT $max";	
	//echo "$query\n";
	$res = mysql_query($query,$db);
	if($res){
		switch ($fmt){
			case 'xml'  : $out = return_XML($res); break;
			case 'html' : $out = return_HTML($res); break;
			case 'txt'  : $out = return_TXT($res,"\n"); break;
			case 'csv'  : $out = return_TXT($res,';'); break;
			case 'php'  : $out = return_PHP($res); break;
			case 'js'   : 
			default     : $out = return_JS($res);
		}
	}
	echo $out;
}
