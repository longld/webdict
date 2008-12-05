<?php
include('dict_functions.php');
include('dict_config.php');

if (isset($_POST['submit']) && isset($_POST['user']) && isset($_POST['pass']) ){
	$user = $_POST['user'];
	$pass = $_POST['pass'];
	$word = $_POST['word'];
	$meanings = $_POST['meanings'];
	if($user!= '----' || md5($pass)!= '---'){
		echo '<h2>Xin lỗi, tính năng này chưa hoàn thành!</h2>';
		echo 'Trở về <a href="/dict/">trang từ điển</a>.';
		exit;
	}
}

$action = $_GET['action'];
$dict   = $_GET['dict'];
$id     = isset($_GET['id'])?$_GET['id']:-1;
$title = array('add'=>'Thêm', 'edit'=>'Sửa');
$ok = preg_match("/^(edit|add)$/",$action) && preg_match("/^[vienfrderu]{2}_[vienfrderu]{2}$/",$dict);
$_vi = preg_match("/vi_\w{2}/",$dict)? 'f_vi' : 'f_novi';
$word = '';
$meanings = '';

if($ok && $id>0){
	$db = mysql_connect($dbhost,$dbuser,$dbpass) or die('Could not connect: ' . mysql_error());
	mysql_select_db($dbname) or die('Could not select database');
	$query = "SET NAMES 'UTF8'";
	mysql_query($query,$db);
	$query = 'SELECT * FROM '.$dict." WHERE d_id='$id'";
	//echo $query;
	$res = mysql_query($query,$db);
	if($res){
		$row  = mysql_fetch_assoc($res);
		$word = $row['d_word'];
		$meanings = $row['d_meanings'];
	} else {
		echo "ERROR: ";
		exit;
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
<body>
<center>
<h1>VnOSS webdict :: <?php echo $title[$action];?></h1>
<H2><?php echo $DICT[$dict];?></h2>
	
<form name="fdict" method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
<?php include('chim-radio.html');?>
<fieldset class="fs">
<legend>Từ</legend>
<input id="<?php echo $_vi;?>" type="text" name="word" value="<?php echo $word;?>" 
  class="inputWord" maxlength="64">
</fieldset>

<br />
<fieldset class="fs">
<legend>Nghĩa</legend>
<textarea class="textMeanings" name="meanings"><?php echo $meanings;?></textarea>
</fieldset>
<br />
<fieldset class="fs">
<legend>Xác thực</legend>
Tên <input type="text" name="user" value="" class="inputUser" maxlength="36">&nbsp;
Mật mã <input id="f_pass" type="password" name="pass" value="" class="inputPass" maxlength="36">
</fieldset>

<br />
<input type="hidden" name="dict" value="<?php echo $dict;?>">
<input type="submit" name="submit" value="<?php echo $title[$action];?>">
</form>
<hr noshade size=1 width="50%">
<a href="/dict/">Trang từ điển</a>
</center>
<script type="text/javascript">
DISPLAY_ID = [ "chim_off", "chim_vni", "chim_telex", "chim_viqr" ];
NOOP = ["f_pass","f_novi"];
SPELLCHECK_ID="";
VKSetMethod(0);
</script>
</body>
</html>
