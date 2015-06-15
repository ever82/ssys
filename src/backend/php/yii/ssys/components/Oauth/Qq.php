<?php 
/**
 * QQ oauth2.0
 * @author xyz
 *
 */
class Qq 
{
  const GET_AUTH_CODE_URL = "https://graph.qq.com/oauth2.0/authorize";
  const GET_ACCESS_TOKEN_URL = "https://graph.qq.com/oauth2.0/token";
  const GET_OPENID_URL = "https://graph.qq.com/oauth2.0/me";
  
  private $_curl;
  public function __construct(){
    $this->_curl = new CURL();
    Yii::app()->session['oauth'] = array_merge(Yii::app()->session['oauth'],array('site'=>'qq'));
  }
  
  /**
   * 构造取得Authorize Code的URL 
   * @return string
   */
  public function getAuthorizeCodeUrl(){
    $appid = Yii::app()->oauth->config['qq']['appId'];    
    $scope = Yii::app()->oauth->config['qq']['scope'];
    $callback = $this->_getCallBackUrl();
    //生成校验码
    $state = md5(uniqid(rand(), TRUE));
    Yii::app()->session['oauth'] = array_merge(Yii::app()->session['oauth'],array('state'=>$state));    
    //构造请求参数列表
    $keysArr = array(
      "response_type" => "code",
      "client_id" => $appid,
      "redirect_uri" => $callback,
      "state" => $state,
      "scope" => $scope
    );
    
    $loginUrl = self::GET_AUTH_CODE_URL.'?'.http_build_query($keysArr);
    
    return $loginUrl;
  }
  
  /**
   * 取得Authorize Code，在callback页面调用
   * 注意此code会在10分钟内过期。
   * @return string
   * @throws Exception
   */
  public function getAuthorizeCode(){
    $state = Yii::app()->request->getParam('state');    
    //验证state防止CSRF攻击
    if($state != Yii::app()->session['oauth']['state']){
      throw new Exception('错误的校验码');
    }
    $code = Yii::app()->request->getParam('code');
    Yii::app()->session['oauth'] = array_merge(Yii::app()->session['oauth'],array('authorize_code'=>$code));
    return $code;        
  }
  
  /**
   * 取得访问用户信息的Access code，,从服务器取得access code失败的情况下抛出异常
   * @return string
   * @throws Exception
   */
  public function getAccessCode(){
    $appid = Yii::app()->oauth->config['qq']['appId'];
    $appkey = Yii::app()->oauth->config['qq']['appSecret'];
    $code = Yii::app()->session['oauth']['authorize_code'];
    $callback = $this->_getCallBackUrl();
    
    //构造请求参数列表
    $keysArr = array(
      "grant_type" => "authorization_code",
      "client_id" => $appid,
      "redirect_uri" => $callback,
      "client_secret" => $appkey,
      "code" => $code
    );   
    
    $response = $this->_curl->simple_get(self::GET_ACCESS_TOKEN_URL,$keysArr);
    
    //出错的返回
    $msg = $this->_parseResponse($response);
    if(isset($msg->error)){
      throw new Exception( $msg->error_description);
    }
    
    $params = array();
    parse_str($response, $params);
    
    Yii::app()->session['oauth'] = array_merge(Yii::app()->session['oauth'],
      array('access_code'=>$params['access_token'],
        'start_at'=>time(),//access_code生成时间
        'expires_in'=>$params['expires_in']//access_code过期时间
      ));
    return Yii::app()->session['oauth']['access_code'];    
  }
  
  /**
   * 取得用户在本站点的唯一标识符,从服务器取得openid失败的情况下抛出异常
   * @throws Exception
   * @return string
   */
  public function getOpenId(){
    $keysArr = array(
      "access_token" => Yii::app()->session['oauth']['access_code']    
    );
    $response = $this->_curl->simple_get(self::GET_OPENID_URL,$keysArr);
    //出错的返回
    $msg = $this->_parseResponse($response);
    if(isset($msg->error)){
      throw new Exception( $msg->error_description);
    }
    Yii::app()->session['oauth'] = array_merge(Yii::app()->session['oauth'],
      array('openid'=>$msg->openid));
    return Yii::app()->session['oauth']['openid'];
  }
  
  /**
   * 取得回调URL
   * @return string
   */
  protected  function _getCallBackUrl(){
    $callback = Yii::app()->oauth->config['qq']['callback'];
    $callback = Yii::app()->request->getHostInfo().Yii::app()->urlManager->createUrl($callback);
    return $callback;
  }

  /**
   * 解析返回数据
   * @param string &$response
   * @return object
   */
  protected function _parseResponse(&$response){
    if(strpos($response, "callback") !== false){
      $lpos = strpos($response, "(");
      $rpos = strrpos($response, ")");
      $response  = substr($response, $lpos + 1, $rpos - $lpos -1);
      $msg = json_decode($response);
      return $msg;
    }
    else 
      return null;
  }
}