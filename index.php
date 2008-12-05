<?php
//-----------------------------------------------------------------
//  Webdict for VnOSS
//  Data from HND (http://www.informatik.uni-leipzig.de/~duc/Dict/)
//
//  Author : vnpenguin@gmail.com
//  Date: Sun Jan  8 17:40:22 CET 2006
//-----------------------------------------------------------------
include('dict_functions.php');
include('dict_config.php');

$db = mysql_connect($dbhost,$dbuser,$dbpass) or die('Could not connect: ' . mysql_error());
mysql_select_db($dbname) or die('Could not select database');
$query = "SET NAMES 'UTF8'";
mysql_query($query,$db);

$_word = '';
$links = '';

//-------------------------------------------------------------------------------
if(isset($_POST['submit']) 
	OR (isset($_REQUEST['word']) AND isset($_REQUEST['dict']))
	OR (isset($_REQUEST['id']) AND isset($_REQUEST['dict']))
){
	$dict = $_REQUEST['dict'];
	$word = $_REQUEST['word'];
	$fmt  = $_REQUEST['fmt'];
	$id   = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0;	
	// Testing for this moment
	//$dict = 'en_vi';
	//$fmt  = 'html';
	$max = 50;

	if($id)
		$query = 'SELECT * FROM '.$dict." WHERE d_id='$id'";	
	elseif (strpos($word,'*')){
		$_word = str_replace('*','%',$word);
		$query = 'SELECT * FROM '.$dict." WHERE d_word LIKE '$_word' LIMIT $max";
		$fmt = 'html';
	} else {
		$query = 'SELECT * FROM '.$dict." WHERE d_word='$word'";
	}
	//$query = 'SELECT * FROM '.$dict." WHERE word LIKE '%$word%' ";	
	//echo "$query\n";
	$res = mysql_query($query,$db);
	if($res){
		$row  = mysql_fetch_assoc($res);
		$word = $word?$word:$row['d_word'];
		switch(strtolower($fmt)){
			case 'context':
				$result = fmtCONTEXT($row); break;
			case 'latex':
				$result = fmtLATEX($row); break;
			case 'xml':
				$result = fmtXML($row); break;
			case 'txt':
				echo fmtTXT($row); 
				exit;
				break;
			default:
				if ($_word){
					$result = fmtHTML2($res);
				} else {
					$result = fmtHTML($row);
					$links = vicinityLinks($row['d_id']); 
				}
		}

	} else {
		$result = 'Error: '.mysql_error();
	}
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html dir="ltr">
<head>
	<title>VnOSS - Webdict</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="stylesheet" type="text/css" href="dict.css" />
	<script type="text/JavaScript" src="xvnkb.js"></script>
	<script type="text/JavaScript" src="dict.js"></script>
</head>
<body onload="InitQuery('qStr','ACList',50)">
<h1>VnOSS webdict <span id="dictName"></span></h1>
<form name="fdict" method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
<table>
<tr>
	<td>Từ điển</td>
	<td><?php echo Select_Dict($dict);?></td>
</tr>
<tr>
	<td>Bộ gõ</td>
	<td><?php include('chim-radio.html');?></td>
</tr>
<tr>
	<td valign="top">Tra từ</td>
	<td><?php jsVarDict($dict);?>
	<input id="qStr" type="text" name="word" onkeyup="doRemoteQuery(this.value)" value="" class="text" 
	autocomplet="off" maxlength="32" >&nbsp;&nbsp;
	<input type="submit" name="submit" value="Tìm">
	<div id="ACList" class="boxhidden"></div>
	<input type="hidden" name="fmt" value="html">
	</td>
</tr>
</table>
</form>

<br>
<div id="results">
<?php
if($result){
	echo $result;
} elseif ($word) {
	echo "<h3>Không tìm thấy từ yêu cầu!</h3>";
}
?>
</div>
<?php if($links) {?>
<div class="vicilinks"><?php echo $links;?></div>
<?php } else { ?>
<hr noshade size="1">
<?php } ?>
<div class="footer">Phiên bản <?php echo VERSION;?> - Dữ liệu từ <a href="http://www.informatik.uni-leipzig.de/~duc/Dict/index.html">HND</a>.</div>

<script type="text/javascript">
DISPLAY_ID = [ "chim_off", "chim_vni", "chim_telex", "chim_viqr" ];
NOOP = ["f_password","word_en"];
SPELLCHECK_ID="";
VKSetMethod(0);
</script>
</body>
</html>
