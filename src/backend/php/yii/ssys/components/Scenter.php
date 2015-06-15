<?php

class Scenter extends SsysClient
{  
  /**
   * 表示该网站通常用的登录url,在用scenter的用户系统无法登录该网站时需要用它
   * @var string $regularLoginUrl;
   */
  public $regularLoginUrl;  
  
  /**
   * 返回$sockpuppetname对应的scenterId
   */
  public function getScenterId($sockpuppetname){
    $url="/ssys/appGetScenterId.json";
    return $this->secureGet($url,$sockpuppetname);
  }

  /**
   * 返回两个用户之间的成员关系
   */
  public function getMembership($user1,$user2){
    $url="/member/appGetMembership.json";
    return $this->secureGet($url,array($user1->username,$user2->username));
  }
  
  
  public function regularLogin(){
    $returnUrl=Yii::app()->request->url;
    Yii::app()->user->returnUrl=$returnUrl;
    Yii::app()->request->redirect($this->regularLoginUrl);
  }
  
	/**
	 * 让该用户从当前浏览器借助scenter登录的全部app(包括scenter)中logout 
	 */
  public function logout(){
		Yii::app()->user->logout();
		Yii::app()->user->returnUrl=Yii::app()->homeUrl;
		$url="/site/logoutAll?sitename=".$this->sitename;
		$this->redirect($url);
  }
  
  /**
   * 用户利用该接口通过scenter来登录当前app
   */
  public function loginApp(){
	  $currentSite=Yii::app()->scenter->host;
    $referer=Yii::app()->request->urlReferrer;
    Yii::log("referer=$referer","debug");
    if($referer!=null){
      preg_match("/^(https?:\/\/)?([^\/]+)/",$referer,$matches);
      $entrySite=$matches[2];
      
      //entrysite的作用就是给scenter自动挑选一个用户可能已经登录的网站通行证来登录scenter,
      //进而登录当前网站.
      //如果entrysite等于当前网站,那么就无法借助它来登录当前网站了,还会造成redirect循环,
      //所以要将它设为空
      if($entrySite==$currentSite){
        $entrySite=null;
      }
    }else{
      $entrySite=null;
    }
    $json=json_encode(array($this->sitename,$entrySite));
    $url="/site/loginApp?json=".$json;
    $this->redirect($url);
  }

  /**
   * 生成一个hash,证明当前app的当前用户对当前操作的授权
   */
  /*public function generateTicket($url){
    $user_id=Yii::app()->user->id;
    $user=User::model()->findByPk($user_id);
    $username=$user->username;
    $cleartext=json_encode(array($url,$username,time()));
    $ticket=$this->hash($cleartext);
    return array($cleartext,$ticket);
  }*/
  
  public function loginScenter(){
    $url="/site/loginScenterFromApp";
    $user_id=Yii::app()->user->id;
    $user=User::model()->findByPk($user_id);
    $username=$user->username;
    //list($cleartext,$ticket)=$this->generateTicket($url);
    //$json=json_encode(array($this->sitename,$cleartext,$ticket));
    //$url=$url."?json=".$json;
    $this->secureRedirect($url,$username);
  }
  
} 
