<?php

class SsysWebUser extends CWebUser
{
  /**
   * 返回当前登录用户的model
   */
  public function getModel(){
    return User::model()->findByPk($this->id);
  }
  
  public function getIsAdmin(){
    $user = $this->model;
    if(!isset($user)){
      return false;
    }
    return $user->isAdmin();
  }  
}