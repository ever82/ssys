<?php
class SsysDbTestCase extends CDbTestCase
{
  /**
   * @var array $temp 用它在tests之间传递数据
   */
  public $temp=array();
  
  public static function tearDownAfterClass()
  {
      Yii::app()->onEndRequest(new CEvent(null));
  }
  
  /**
   * 模拟登录
   */
  public function ssyslogin($username=null){
      if(isset($username)){
        echo "ssyslogin, username=".$username."\n";
        $user1=User::model()->findByAttributes(array('username'=>$username));
        if(!isset($user1)){
          $user1=User::create($username,$username."@test.com","a");
        }
        $this->assertNotNull($user1);
      }else{
        $user1=$this->users('user1');
	  }
	  Yii::app()->user->id=$user1->id;    
	  Yii::app()->user->name=$user1->username;
  }
  public function ssyslogout(){
    Yii::app()->user->id=null;
    Yii::app()->user->name=null;
  }
  public function createUser($username=null){
    if(!isset($username)){
      $username=uniqid();
    }
    return User::create($username,$username."@test.com","a");
  }
}