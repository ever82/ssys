<?php

class UserTest extends DbTestCase
{
	public $fixtures=array(
		'users'=>'User',
	);
	
	public function testOauth(){
	  $user=User::createByOauth("oauthuser1","1234","taobao");
	  $this->assertEquals($user->username,"oauthuser1");
	  $this->assertEquals($user->provider,"taobao");
	  $this->assertEquals($user->openid,"1234");
	}
	
	public function testLocalCreate(){
	  $user=$this->createUser();
	  $this->assertNotNull($user);
	  $this->assertEquals($user->username,"u1");

	}
	
	public function testGet(){
    $user=User::model()->findByAttributes(array('username'=>'user1'));
    $this->assertNotNull($user);
	}
	
	public function createUser(){
	  $username="u1";
	  $password="a";
	  $password_repeat="a";
	  $isgroup=0;
	  return User::create($username,$password);
	}
}