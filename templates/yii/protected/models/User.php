<?php

class User extends CSsysUser
{
  const VU_PSW="1111abcd";
  public $attris= array('id','username','agent_id','agent_username','role','registerip','created_at','checked_at','login_at','logout_at','has_photo','weight' ,'points','verdict_count','sample_count','fa_count','shang_count','fa_amount','shang_amount','plaintiff_count','defendant_count','reconciled_count','fulfilled_count');
  public static function create($username,$email,$password=null,$role=null,$agent_id=null,$agent_type=null){
    $model=new self;
    $model->email=$email;
    $model->username=$username;
    $model->password=$password;
    //$model->password_repeat=$password_repeat;
    $model->created_at=time();
    $model->registerip=$_SERVER['REMOTE_ADDR'];
    $model->role=$role;
    $user=Yii::app()->user;
    if(isset($agent_id)){
      $model->agent_id=$agent_id;
      $model->agent_type=$agent_type;
    }
    if($model->save()){
      if(!isset($user->id)){
        self::login($username,$password,true);
      }
      return $model;
    }else{
      echo json_encode($model->errors);
      Yii::log("Failed to create a User model!".json_encode($model->errors),'error','application.models');
      return null;
    }
  }
  public static function createInvitee($invitation,$username){
    return self::create($username,null,$invitation->code,"invited_rater",$invitation->creator_id,"Plaintiff");
  }
}