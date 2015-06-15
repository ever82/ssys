<?php

return CMap::mergeArray(
	require(dirname(__FILE__).'/main.php'),
	array(
		'components'=>array(
			'fixture'=>array(
				'class'=>'system.test.CDbFixtureManager',
			),
      'log'=>array(
              'routes'=>array(
                      array(
                              'class'=>'CFileLogRoute',
                              'levels'=>'error, warning',
                              'LogFile'=>'test.log',
                      ),
              ),
      ),
      /*'db'=>array(
        'tablePrefix'=>'testssys_',
        'connectionString' =>
        'mysql:host=localhost;dbname=test_testssys',
        'emulatePrepare' => true,
        'username' => 'root',
        'password' => 'a',
        'charset' => 'utf8',
      ),*/
		),
	)
);
