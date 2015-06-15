<?php 

class Weibo
{
  const GET_AUTH_CODE_URL = "https://api.weibo.com/oauth2/authorize";
  const GET_ACCESS_TOKEN_URL = "https://api.weibo.com/oauth2/access_token";
  
  private $_curl;
  public function __construct(){
    $this->_curl = new CURL();
    Yii::app()->session['oauth'] = array_merge(Yii::app()->session['oauth'],array('site'=>'weibo'));
  }
  
  /**
   * 构造取得Authorize Code的URL
   * @return string
   */
  public function getAuthorizeCodeUrl(){
    $appid = Yii::app()->oauth->config['weibo']['appId'];    
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
      "display" => null
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
    $appid = Yii::app()->oauth->config['weibo']['appId'];
    $appkey = Yii::app()->oauth->config['weibo']['appSecret'];
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
  
    $response = $this->_curl->simple_post(self::GET_ACCESS_TOKEN_URL,$keysArr);
  
    //出错的返回
    $params = $this->_parseResponse($response);
    if(isset($params['error'])){
      throw new Exception( $params['error_description']);
    }
  
    Yii::app()->session['oauth'] = array_merge(Yii::app()->session['oauth'],
    array('access_code'=>$params['access_token'],
    'start_at'=>time(),//access_code生成时间
    'expires_in'=>$params['expires_in'],//access_code过期时间
    'openid'=>$params['uid']//授权用户的唯一uid
    ));
    return Yii::app()->session['oauth']['access_code'];
  }
  
  /**
   * 取得用户在本站点的唯一标识符
   * @return string
   */
  public function getOpenId(){
    if(isset(Yii::app()->session['oauth']['openid']))
      return Yii::app()->session['oauth']['openid'];
    else
      return '';
  }
  
  /**
   * 取得回调URL
   * @return string
   */
  protected  function _getCallBackUrl(){
    $callback = Yii::app()->oauth->config['weibo']['callback'];
    $callback = Yii::app()->request->getHostInfo().Yii::app()->urlManager->createUrl($callback);
    return $callback;
  }
  
  /**
   * 解析返回数据
   * @param string &$response
   * @return object
   */
  protected function _parseResponse(&$response){
    $obj = json_decode($response,true);
    if(is_array($obj)){
      return $obj;
    }
    else
      return null;
  }  
}