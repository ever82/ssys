<?php

/**
 * This is the model class for table "{{user}}".
 *
 * The followings are the available columns in table '{{user}}':
 * @property integer $id
 * @property string $username
 * @property string $password
 */
class CSsysUser extends SsysBaseModel
{
  public $attris= array('id','username','agent_id','agent_username','role','registerip','created_at','checked_at','has_photo');
  public $password_repeat;
  
  /**
   * 通过oauth的userinfo来注册用户
   */
  public function createByOauth($username,$openid,$provider){
    Yii::log("begin to create a user by oauth, username=$username,openid=$openid,provider=$provider",'info','application.user.create');
    $model=new self;
    $model->username=$username;
    $user=User::model()->findByAttributes(array('username'=>$model->username));
    if(isset($user)){
      $model->username=$model->username."_".$provider;
    }
    $model->provider=$provider;
    $model->openid=$openid;
    $model->created_at=time();
    $model->registerip=$_SERVER['REMOTE_ADDR'];
    if($model->save()){
      
      return $model;
    }else{
      Yii::log("Failed to create a User model!".json_encode($model->errors),'error','application.models');
      return null;
    }
    
  }
  
  public static function login($username,$password,$rememberMe=0){
    	  if(strpos($username,"@")!==false){
	    $user=User::model()->findByAttributes(array('email'=>$username));
	    if(!isset($user)){
	      return "wrongEmail";
	    }
	    $username=$user->username;
	  }
      $identity=new UserIdentity($username,$password);
      $identity->authenticate();
      if($identity->errorCode===UserIdentity::ERROR_NONE){
        $duration=$rememberMe ? 3600*24*30 : 0; // 30 days
        Yii::app()->user->login($identity,$duration);
        $user=Yii::app()->user->model;
        error_log("user($username) login. duration=$duration",0);
        $user->login_at=time();
        $user->save();
        return $user;
      }else{
        return $identity->errorCode;
      }

  }
  
  
  
  public static function scenterCreate($username,$scenterUserid){
    $model=new self;
    $modelWithTheSameName=User::model()->findByAttributes(array('username'=>$username));
    if($modelWithTheSameName){
      $username="scenter_".$username;
      $modelWithTheSameName=User::model()->findByAttributes(array('username'=>$username));
      if($modelWithTheSameName){
        $username=$username."_".$scenterUserid;
      }
      $modelWithTheSameName=User::model()->findByAttributes(array('username'=>$username));
      if($modelWithTheSameName){
        $username=$username."_".time();
      }
    }
    $model->username=$username;
    $model->created_at=time();
    
    if($model->save()){
      $model->randomid=$model->id;
      $model->save();
      return $model;
    }else{
      echo json_encode($model->error);
      Yii::log("Failed to create a User model!".json_encode($model->error),'error','application.models');
      return null;
    }
  }
  
  public static function addVirtualUser($username,$agent_id=null,$agent_type=null){
    $user=User::model()->findByAttributes(array("username"=>$username));
    if(isset($user)){
      return $user;
    }
    $model=new self;
    $model->created_at=time();
    $model->username=$username;
    $model->password=User::VU_PSW;
    if(isset($agent_id)){
      $agent=User::model()->findByPk($agent_id);
      $model->agent=$agent;
    }else{
      $model->agent_id=1;//1是管理员的id
      $model->agent_username="管理员";
    }
    $model->agent_type=$agent_type;
    if($model->save()){
      return $model;
    }else{
      throw CException("添加虚拟用户失败!");
    }
  }
  
  public function isAdmin(){
    return preg_match("/admin/",$this->role);
  }
  
  public function isUpdatable($params){
    return $this->id==Yii::app()->user->id;
  }  
  
  
  public function getRelationToUser($user){
    if($this->id!=$user->id){
      return Yii::app()->scenter->getMembership($this,$user);
    }else{
      return "==";
    }
  }
  
  
    
  /**
   * perform one-way encryption on the password before we store it in the database
   */
  protected function afterValidate()
  {
    parent::afterValidate();
    if(isset($this->password) && $this->isNewRecord){
      $this->password = $this->encrypt($this->password);
    }
  }
  public function encrypt($value)
  {
    return md5($value);
  }

	/**
	 * @return string the associated database table name
	 */
	public function tableName()
	{
		return '{{user}}';
	}

	/**
	 * @return array validation rules for model attributes.
	 */
	public function rules()
	{
		// NOTE: you should only define rules for those attributes that
		// will receive user inputs.
		return array(
			array('username,created_at', 'required'),
			array('username','unique'),
			array('has_photo','boolean'),
			array('username, password,role', 'length', 'max'=>128),
			array('checked_at,password_repeat,agent_id,role,registerip,agent_username', 'safe'),
			// The following rule is used by search().
			// Please remove those attributes that should not be searched.
			array('id, username', 'safe', 'on'=>'search'),
			);
	}

}