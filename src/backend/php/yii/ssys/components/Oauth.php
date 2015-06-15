<?php
class  Oauth extends  CComponent
{  
  //oauth登陆适配器
  private $_adapt;
  
  public $config;  
  /**
   * 构造登陆oauth类   * 
   */
  public function __construct(){
    
  } 
  
  /**
   * CComponent必须实现的方法
   */
  public function init(){
    
  }
  
  /**
   * 设置站点,决定调用对应的站点适配器
   * @param string $site 登陆站点，值可以是qq|weibo
   */
  public function setSite($site){
    $site = ucfirst(strtolower($site));    
    require_once dirname(__FILE__).DIRECTORY_SEPARATOR.'Oauth'.DIRECTORY_SEPARATOR.$site.'.php';    
    $this->_adapt = new $site;
  }
  
  /**
   * 构造获取Authorize Code的URL 
   * @return string
   */
  public function getAuthorizeCodeUrl(){
    return   $this->_adapt->getAuthorizeCodeUrl();    
  }
  
  /**
   * 取得Authorize Code
   * @return string
   */
  public function getAuthorizeCode(){    
    $code =  $this->_adapt->getAuthorizeCode();    
    return $code;
  }
  
  /**
   * 取得用户的access code
   * @return string
   */
  public function getAccessCode(){
    $accessCode =  $this->_adapt->getAccessCode();    
    return $accessCode;
  }
  
  /**
   * 取得用户在本站点的唯一标识符
   * @return string
   */
  public function getOpenId(){
    $openId = $this->_adapt->getOpenId();
    return $openId;
  }
  
  /**
   * 清除缓存的oauth信息
   */
  public function clear(){
    Yii::app()->session['oauth'] = array();
  }
}