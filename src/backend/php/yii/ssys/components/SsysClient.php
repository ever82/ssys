<?php
/**
 * 表示一个SSys 类型的网站(包括scenter 网站和它的各种app)的客户端,
 * 用它能够方便跟该网站沟通.
 * 它跟SSysGeneralClient的不同在于它是只用于跟一个网站沟通的,
 * 后者是用于跟多个网站沟通的,所以这里有baseUrl,而后者没有
 */
class SsysClient extends SsysGeneralClient
{
  /**
   * 一个客户端代表了一个网站,
   * 这表示该网站的baseUrl,如 localhost/index.php
   * @var string $baseUrl
   */
  public $baseUrl;
  
  /**
   * 表示该网站拥有的资源的配置数组,这样就可以根据配置创建resources了
   * @var array $resources
   */
  public $resources;
  
  /**
   * 表示该网站拥有的资源的对象数组
   * @var array $_resources
   */
  private $_resources;
  
  public function init(){
    $this->_resources=array();
    parent::init();
  }
  
  /**
   * 返回当前网站在scenter登记的appid,即保存在数据库app表中的id
   */
  public function getAppid(){
    $app=$this->app->findByAttributes(array("name"=>$this->sitename));
    return $app->id;
  }
  
  
  
  public function __get($name)
  {
    if (array_key_exists($name, $this->resources)) {
        return $this->_getResource($name);
    }

    return parent::__get($name);
  }
  
	function _getResource($name)
	{
	  if(!array_key_exists($name,$this->_resources)){
	    $config=$this->resources[$name];
	    $this->_resources[$name]=new SsysResource($this,$name,$config);
	  }
    return $this->_resources[$name];
	}
	
  /**
   * 凭ScenterId 来注册当前网站的帐号
   */
  public function registerByScenterId($scenterUserid,$username,$isGroup){
    //error_log("[info]开始利用scenterId($scenterUserid,$username,$isGroup)在本网站注册马甲 \n",0);
    $user=User::scenterCreate($username,$scenterUserid,$isGroup);
    //error_log("[info]成功注册了本地帐号(".$user->username."),还需要去scenter登记马甲 \n",0);
    Yii::app()->scenter->sockpuppet->create($scenterUserid,$user->username);
    //error_log("[info]成功在scenter登记了马甲 \n",0);
    return $user;
  }
	
  public function get($uri, $params = array())
  {
    $uri=$this->baseUrl.$uri;

    return parent::get($uri, $params);
  }

  public function post($uri, $params = array())
  {
    $uri=$this->baseUrl.$uri;
    return parent::post($uri, $params);
  }
  
  /**
   * 验证是否该client对应的server产生的hash
   * @return boolean 
   */
  public function serverValidateHash($hash,$cleartext){
    $url="/ssys/validateHash.json";
    $param=array('cleartext'=>$cleartext,'hash'=>$hash);
    return $this->post($url,$param);
  }
  
  public function redirect($url,$param = array()){
    if(!preg_match("/^https?:\/\//",$url)){
      $url=$this->baseUrl.$url;
    }
    $url=$this->addParamsToUrl($url,$param);
    Yii::app()->request->redirect($url);
    Yii::app()->end();
  }
  
  public function getHost(){
    preg_match("/^(https?:\/\/)?([^\/]+)/",$this->baseUrl,$matches);
    return $matches[2];
  }
}
