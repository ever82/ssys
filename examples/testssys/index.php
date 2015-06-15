<?php
if(isset($_SERVER['HTTP_ORIGIN'])){
  header('Access-Control-Allow-Origin:'.$_SERVER['HTTP_ORIGIN']);
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
  header('Access-Control-Max-Age: 1000');
  header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
  if(isset($HTTP_RAW_POST_DATA)) {
    $params=array();
    parse_str($HTTP_RAW_POST_DATA,$params); // here you will get variable $foo
    foreach($params as $key=>$value){
      $_REQUEST[$key]=$value;
    }
  }
  if(isset($_REQUEST['PHPSESSID'])){
    session_id($_REQUEST['PHPSESSID']);
  }
}

// change the following paths if necessary
$yii=dirname(__FILE__).'/../html/framework/yii.php';
$config=dirname(__FILE__).'/protected/config/main.php';

// remove the following lines when in production mode
defined('YII_DEBUG') or define('YII_DEBUG',true);
// specify how many levels of call stack should be shown in each log message
defined('YII_TRACE_LEVEL') or define('YII_TRACE_LEVEL',3);
require_once($yii);
Yii::createWebApplication($config)->run();

