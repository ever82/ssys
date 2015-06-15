<?php

return array(
  'components'=>array(
      'db'=>array(
        'class' => 'CDbConnection',
        'connectionString' => 'mysql:host=db;dbname=pandingbao',
        'emulatePrepare' => true,
        'username' => 'admin',
        'password' => 'aaaa',
        'charset' => 'utf8',
        'tablePrefix' => '',
      ),
      /*'cache'=>array(
        'class'=>'CMemCache',
        'useMemcached'=>true,
        'servers'=>array(
          array(
              'host'=>'cache',
              'port'=>11211,
              'weight'=>100,
          ),
        ),
      ),*/
      'log'=>array(
        'routes'=>array(
          array(
            'class'=>'CFileLogRoute',
            'levels'=>'error, warning, debug',
            'LogFile'=>'debug.log',
          ),
        ),
      ),
    
  )
);

