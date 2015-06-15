<?php
/**
 * 表示所有SSysSite(包括app和scenter两种网站)的通用客户端,
 * 用它能够方便跟所有SSysSite沟通
 */
class SsysGeneralClient extends CApplicationComponent
{
  /**
   * 这是使用该client的网站(该client在该网站上运行)的名称.
   * app的sitename就是app在scenter登记的名称,
   * scenter的sitename为"Scenter".
   * @var string $sitename
   */
  public $sitename;
  
  /**
  * 这是给oauth登录后返回的url,比如http://pangdingbao.com/
   */
  public $homeUrl;
  
  /**
   * 用它来生成SsysPass
   * @var string $salt
   */
  public $salt;       
  
  private $_curl;
  
  /**
   * 返回当前登录的user,如果没有登录,就返回null
   * @return User|null
   */
  public function getCurrentUser(){
    $id=Yii::app()->user->id;
    if($id){
      return User::model()->findByPk($id);
    }
  }
  
  /**
   * 登录$user,保持$duration长时间
   */
  public function login($user,$duration=1000){
    $identity=new UserIdentity($user->username,$user->password);
    $identity->authenticateByUserid($user->id);
    Yii::app()->user->login($identity,$duration);
  }
  
  
  public function createSsysPass($info,$returnJson=true){
    $sitename=$this->sitename;
    $currenttime=time();
    
    //本来应该连$url也一起弄进去的,那会更安全一些,但是处理起来麻烦了点,先就这样了
    $cleartext=json_encode(array($sitename,$currenttime,$info));
    $hash=$this->hash($cleartext);
    $ssysPass=array($sitename,$currenttime,$info,$hash);
    if($returnJson){
      return json_encode($ssysPass);
    }else{
      return $ssysPass;
    }
  }
  
  /**
   * 用来创建ticket,该ticket包含cleartext和hash两部分信息,
   * 而cleartext中的信息是可以被解码提取出来的,
   * hash能用来验证这些提取出来的信息是由当前app生成的
   * @param array $url 表示该ticket要被发去的服务器端的地址
   * @param array $info 表示服务器端需要验证真伪的信息 
   */
  public function securePost($url,$info){
    $SsysPass=$this->createSsysPass($info);
    $param=array(
      'SsysPass'=>$SsysPass
    );
    return $this->post($url,$param);
  }
  
  public function secureGet($url,$info=null){
    $SsysPass=$this->createSsysPass($info);
    $param=array(
      'SsysPass'=>$SsysPass
    );
    return $this->get($url,$param);
  }
  
  public function secureRedirect($url,$info=null){
    $SsysPass=$this->createSsysPass($info);
    $param=array(
      'SsysPass'=>$SsysPass
    );
    return $this->redirect($url,$param);
  }
    
  public function hash($cleartext){
    return md5($cleartext.md5($this->salt));
  }
  
  /**
   * 验证是否当前app 产生的hash
   * @return boolean
   */
  public function clientValidateHash($hash,$cleartext){
	  return $hash == $this->hash($cleartext);
  }
  
  public function getCurl(){
    if(!isset($this->_curl)){
      $this->_curl=new CURL;
    }
    return $this->_curl;
  }
  
  public function redirect($url,$param = array()){
    $url=$this->addParamsToUrl($url,$param);
    Yii::app()->request->redirect($url);
    Yii::app()->end();
  }
  	
  public function get($uri, $params = array())
  {
    return $this->_call('get', $uri, $params);
  }

  public function post($uri, $params = array())
  {
    return $this->_call('post', $uri, $params);
  }
    
  /**
   * @param array $params
   * @param string $url
   */
  public function addParamsToUrl($uri,$params){
    $querystring1=http_build_query($params);
    $pos=strpos($uri,"?");
    if($pos){
      $querystring0=substr($uri,$pos+1);
      $uri=strstr($uri,"?",true);
      $uri=$uri.'?'.$querystring0."&".$querystring1;
    }else{
      $uri=$uri.'?'.$querystring1;
    }
    return $uri;
  }
  
  protected function _call($method, $uri, $params = array())
  {
    //Yii::app()->slog->info("开始发送curl请求","uri=",$uri);
    if(strtoupper($method)=="GET"){
      $uri=$this->addParamsToUrl($uri,$params);
    }
    
    $this->curl->create($uri);
    
    $this->curl->{$method}($params);

    // Execute and return the response from the server
    $response = $this->curl->execute();
    if($response=== false){
      $completeUrl=$this->addParamsToUrl($uri,$params);
      //Yii::app()->slog->error("request失败","completeUrl=",$completeUrl);
      echo "request失败,完整的url是:".$completeUrl;
      throw new CException("SsysGeneralClient request uri($uri)+params(".json_encode($params).") failed!");
    }
    /*preg_match ( "/(\.(\w+))?(\?|$)/" , $uri , $matches);
    $format=$matches[2];
    // Format and return
    if ($format !== NULL)
    {
      $response=$this->_format_response($response,$format);
    }*/
    return json_decode($response,true);
  }
  
  protected function _format_response($response,$format)
  {
    switch($format){
    case 'json':
      $response=json_decode($response,true);
      break;
    }
    return $response;
  }
}
