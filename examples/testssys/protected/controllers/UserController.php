<?php

class UserController extends Controller
{
  public function actionSetPassword(){
    $user=Yii::app()->scenter->currentUser;
    if(!isset($user)){
      throw new CHttpException(403,"只有登录用户才能调用该接口");
    }
    $password=$_REQUEST['p'];
    $user->password=$user->encrypt($password);
    if(!$user->save()){
      throw new CHttpException(500,"数据保存失败,请再试一遍");
    }
    $this->renderResult("success");
  }
  /**
   * 取得第三方登陆地址,site值可以用qq|weibo
   */
  /*public function actionAuthorizeCodeUrl(){
    $oauth = Yii::app()->oauth;
    $oauth->clear();
    $site = Yii::app()->request->getParam('site','qq');
    $oauth->setSite($site);
    echo '<a href="'.$oauth->getAuthorizeCodeUrl().'">'.$site.'登陆</a>';
  }
  
  public function actionCallBack(){
    $oauth = Yii::app()->oauth;
    $oauth->setSite(Yii::app()->session['oauth']['site']);
    $oauth->getAuthorizeCode();
    $oauth->getAccessCode();
    $openid = $oauth->getOpenId();   
    echo 'openid值为'.$openid;
    //取得绑定用户
    $sockpuppet = Sockpuppet::model()->findByAttributes(array('openid'=>$openid));
    if ($sockpuppet) {
      $user = User::model()->findByPk($sockpuppet->user_id);      
    }
  }*/

  public function filterIsUpdatable($filterChain){
    $user=Yii::app()->scenter->currentUser;
    $model=$this->loadModel();
    if($model->id!=$user->id){
      throw new CHttpException(403,"只有用户本人才能更新它");
    }
    $filterChain->run();
  }
}
