<?php

// change the following paths if necessary
$yiit=dirname(__FILE__).'/../../../html/framework/yiit.php';
$config=dirname(__FILE__).'/../config/test.php';
//define('YII_ENABLE_EXCEPTION_HANDLER',true);
//define('YII_ENABLE_ERROR_HANDLER',true);
define('YII_DEBUG',true);
// specify how many levels of call stack should be shown in each log message
define('YII_TRACE_LEVEL',1);

require_once($yiit);
Yii::createWebApplication($config);

