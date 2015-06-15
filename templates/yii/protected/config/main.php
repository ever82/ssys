<?php

// uncomment the following to define a path alias
// Yii::setPathOfAlias('local','path/to/local-folder');

// This is the main Web application configuration. Any writable
// CWebApplication properties can be configured here.
if($_SERVER['DEVELOP_ENV']=="development"){
  $configPath=dirname(__FILE__).'/localConfig.php';
}else {
  $configPath=dirname(__FILE__).'/productionConfig.php';
}
return CMap::mergeArray(
	require(dirname(__FILE__).'/../extensions/ssys/config.php'),
	array(
    'basePath'=>dirname(__FILE__).DIRECTORY_SEPARATOR.'..',
    'name'=>'大公路网',
    // preloading 'log' component
    'preload'=>array('log'),
    'import'=>array(
      'application.models.*',
      'application.components.*',
      
    ),
    // application components
    'components'=>array(
      'errorHandler'=>array(
        // use 'site/error' action to display errors
        'errorAction'=>'site/error',
      ),
      'log'=>array(
        'class'=>'CLogRouter',
        'routes'=>array(
          array(
            'class'=>'CFileLogRoute',
            'levels'=>'error, warning',
            //'categories'=>'system.*',
            //'LogFile'=>'A.log',
          ),
          // uncomment the following to show log messages on web pages
          /*
          array(
            'class'=>'CWebLogRoute',
          ),
          */
        ),
      ),
    ),
	),
	require($configPath)
);