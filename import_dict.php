#!/usr/bin/php
<?php 

$dbname   = 'vdict';
$dbuser   = 'vdict';
$dbpass   = '';
$dbhost   = 'localhost';
$path = 'data/EV';

$db = mysql_connect($dbhost,$dbuser,$dbpass) or 
    die('Could not connect: ' . mysql_error());
mysql_select_db($dbname) or die('Could not select database');
mysql_query("SET NAMES 'UTF8'",$db);

$data = array (
    'en_vi' => $path.'/anhviet109K.dict'
    'vi_en' => $path.'/vietanh.dict'
);

foreach ($data as $table => $file){
    Prepare_Table($table);
    
    $h = fopen($file,'r');

    $is_word = 0;
    $word = ''; $phonetic = ''; $meanings = '';

    while(!feof($h)){
        $buf = fgets($h, 4096);
        if(preg_match("/^@([^\/]+)\s+\/([^\/]+)\//",$buf,$matches)){
            $word = $matches[1];
            $phonetic = $matches[2];
            $is_word = 1;
            $meanings = '';
        }elseif(preg_match("/^@(.+)\s*$/",$buf,$matches)){
            $word = $matches[1]."---------------------------------";
            $phonetic = '';
            $is_word = 1;
            $meanings = '';
        }
        if($is_word && preg_match("/^[\*\-=!]/",$buf)){
            $meanings .= $buf;
        }
        if($is_word && preg_match("/^\s*$/",$buf)){
            $is_word = 0;
            if($word){
                Import_Word($table,$word,$phonetic,$meanings);
                //echo "$word\n";
            }
            $word = ''; $phonetic = '';        
        }elseif($is_word && preg_match("/^@(.+)\s*$/",$buf,$matches)){
            $_word = $matches[1];
            if($word && $meanings){
                //echo "$word\n";
                Import_Word($table,$word,$phonetic,$meanings);
            }
            $word = $_word; $phonetic = '';$meanings = '';
            $is_word = 1;
        }
    }
    fclose($h);
}

exit;
//---------------------------------------------------
function Import_Word($table,$word,$phonetic,$meanings){
    global $db;
    /*
    echo "Word: $word\n";
    echo "Phonetic: /$phonetic/\n";
    echo "Meanings:\n$meanings\n";
    echo "--------------------------\n";
    */
    $query = 'INSERT INTO '.$table.' (d_word,d_phonetic,d_meanings) VALUES (\''.
        sqlAddslashes($word).'\', \''.sqlAddslashes($phonetic).'\',\''.
        sqlAddslashes($meanings).'\')';
    if(mysql_query($query,$db)){
        echo "$word\n";
    }
}
function sqlAddslashes($str){
    $str = str_replace('\\', '\\\\', $str);
    $str = str_replace('\'', '\'\'', $str);
    return $str;
}
function Prepare_Table($table){
    global $db;
    $query="CREATE TABLE IF NOT EXISTS $table (
  d_id int(6) unsigned NOT NULL auto_increment,
  d_word varchar(64) NOT NULL,
  d_phonetic varchar(64) NOT NULL,
  d_index int(6) NOT NULL,
  d_meanings text NOT NULL,
  PRIMARY KEY  (d_id),
  KEY windex (d_index)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;";
    mysql_query($query,$db);
    mysql_query("TRUNCATE TABLE $table",$db);
}
?>
