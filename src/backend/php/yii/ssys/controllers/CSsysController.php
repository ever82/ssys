<?php
header('P3P: CP="CAO PSA OUR"'); 

class CSsysController extends Controller
{
	public function filters()
	{
		return array(
		  'isScenter + getCurrentUserByScenterIdentity,register,loginByScenter,loginByHand',
		);
	}
	
	
  /*public function actionOauth()
  {
      // 导入OAuth2China
      Yii::import('ext.oauth2china.OAuth2China');
      // 配置各平台参数
      $providers = array(
          'weibo' => array(
              'id' => '4043818406',
              'secret' => '12bc14adc4381aab468a7d3815720d3f',
          ),
          'qq' => array(
              'id' => 'APP ID',
              'secret' => 'APP KEY',
          ),
          'douban' => array(
              'id' => 'API Key',
              'secret' => 'Secret',
          ),
          'renren' => array(
              'id' => 'API key',
              'secret' => 'Secret key',
          ),
      );
  
      $OAuth2China = new OAuth2China($providers);
  
      $provider = $OAuth2China->getProvider('weibo'); // getProvider方法的参数对应$providers配置中的key
  
      if(!isset($_GET['code']))
      {
          // 跳转到授权页面
          $provider->redirect();
      }
      else
      {
          // 获取access token
          $token = $provider->getAccessToken($_GET['code']);
          var_dump($token);
      }
  }*/
	
  public function actionOauth2($provider){
    Yii::log('oauth2, provider='.$provider,'debug','application.controller.ssys');
    Yii::import('ext.oauth2.OAuth2');
    $config = require Yii::getPathOfAlias('ext.oauth2') . '/config.php';

    if ( ! isset($config[$provider]))
    {
        throw new CHttpException('invalid request.');
    }

    try
    {
        $oauth2 = OAuth2::create($provider, $config[$provider]);
    }
    catch (OAuth2_Exception $e)
    {
        throw new CHttpException($e->getMessage());
    }

    if( ! isset($_GET['code']))
    {
        $oauth2->redirect();
    }

    if ( ! $oauth2->validateState(Yii::app()->request->getQuery('state')))
    {
        throw new CHttpException('invalid request.');
    }

    try
    {
        Yii::log('before oauth getToken','debug');
        $token = $oauth2->getToken($_GET['code']);

        if ( ! $token)
        {
            throw new CHttpException('500', $provider . ' - get token error.');
        }
        Yii::log('before oauth getUserInfo','debug');
        $userInfo = $oauth2->getUserInfo($token);
        Yii::log('after oauth getUserInfo,userInfo='.json_encode($userInfo),'debug');

        if ( ! $userInfo)
        {
          throw new CHttpException('500', $provider . ' - get user info error.');
        }else{
          $user=User::model()->findByAttributes(array('openid'=>$userInfo->uid,'provider'=>$provider));
          if(!isset($user)){
            $user=User::createByOauth($userInfo->screen_name,$userInfo->uid,$userInfo->via);
          }
          $identity=new UserIdentity($user->username,$user->password);
          $identity->authenticateByUserid($user->id);
          Yii::app()->user->login($identity,0);
          $user->login_at=time();
          $user->save();
          Yii::app()->request->redirect("/");
        }
    }
    catch (OAuth2_Exception $e)
    {
        throw new CHttpException($e->getMessage());
    }

  }
  
  
	
	
	
	/**
	 * 返回sessionid给ie浏览器做跨域访问用
	 */
	public function actionGetSessionId(){
	  $this->renderResult(Yii::app()->session->sessionID);
	}
	
	
	
	public function filterIsScenter($filterChain){
	  $pass=Yii::app()->request->getParam('SsysPass');
    if($pass==null)
      throw new CHttpException(403,"必须要有ssyspass");
    list($sitename,$currenttime,$info,$hash)=json_decode($pass,true);
    //表示该pass的有效时间是60秒左右
    if(abs(time()-$currenttime)>60)
      throw new CHttpException(403,"ssyspass超时了".abs(time()-$currenttime));
    $cleartext=json_encode(array($sitename,$currenttime,$info));
    if($sitename!="Scenter")
      throw new CHttpException(403,"只有scenter才能使用该接口,pass=".$pass.",sitename=".$sitename."currenttime=".$currenttime);
    if(!Yii::app()->scenter->serverValidateHash($hash,$cleartext))
      throw new CHttpException(403,"只有scenter才能使用该接口4");
    $_POST['SsysPassed']=$info;
    $filterChain->run();
  }
  
  /**
   * 取得当前用户的scenterId,用来给第三方网站的客户端来登录
   */
  public function actionGetScenterId(){
    $user=Yii::app()->user;
    if($user->isGuest){
      $this->renderError("你尚未登录该网站,没法通过它来取得scenterId.");
    }else{
      $scenterId=Yii::app()->scenter->getScenterId($user->name);
      $this->renderResult($scenterId);
    }
  }
  
  
	/**
	 * 根据scenterIdentity 返回当前登录用户,如果未注册,则自动注册
	 */
	public function actionGetCurrentUserByScenterIdentity(){
	  list($scenterUserid,$username,$isGroup)=$_POST['SsysPassed'];
	  //error_log("[info]已经获得scenterId($scenterUserid,$username,$isGroup),准备用它来取得当前登录用户 \n",0);
	  //error_log("[info]首先要取得该scenterId对应的当前网站的马甲 \n",0);
	  $appid=Yii::app()->scenter->getAppid();
	  $sockpuppet=Yii::app()->scenter->sockpuppet->findByAttributes(array('user_id'=>$scenterUserid,'app_id'=>$appid));
	  if(!$sockpuppet){
	    //error_log("[info]发现该scenterId尚未在本网站注册马甲,那么就要用该scenterId注册 \n",0);
	    $user=Yii::app()->scenter->registerByScenterId($scenterUserid,$username,$isGroup);
	    //error_log("[info]成功在本网站注册了马甲,马甲名是".$user->username." \n",0);
	  }else{
	    $user=User::model()->findByAttributes(array('username'=>$sockpuppet->sockpuppetname));
	    if(!$user){
	      Yii::app()->scenter->sockpuppet->delete($sockpuppet->id);
	      $user=Yii::app()->scenter->registerByScenterId($scenterUserid,$username,$isGroup);
	    }
	  }
	  $duration=isset($_REQUEST['duration']) ? $_REQUEST['duration'] : 1000;
	  Yii::app()->scenter->login($user,$duration);
	  $this->renderModel($user);
	}
	
	
	/**
	 * 返回当前登录用户
	 */
	public function actionGetCurrentUser(){
	  if(Yii::app()->user->isGuest){
	    $this->renderError("未登录,当前用户为空,[ssys/getCurrentUser]");
	  }else{
	    $user=Yii::app()->user->model;
	    $this->renderModel($user);
	  }
	}
	
	public function actionXhrLogin(){
	  list($username,$password,$rememberMe)=json_decode($_REQUEST['loginParams']);
	  //error_log("[debug]username=$username,password=$password",0);
	  if(strpos($username,"@")!==false){
	    $user=User::model()->findByAttributes(array('email'=>$username));
	    if(!isset($user)){
	      $this->renderError("wrongEmail");
	      return;
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
        $this->renderModel($user);
      }else{
        $this->renderError($identity->errorCode);
      }
	}
	
  /**
   * 这是登录的首选位置,先跳转到scenter网站看看有没有scenter user登录,
   * 如果有,就把scenter user 对应的当前网站的马甲找出来,发一个ticket跳转回当前网站登录,
   * 如果没有,就看是否有 entrySite 的参数,有就跳转到 entrySite 去登录scenter网站,
   * 如果没有,就在页面列表中选择一个已经登录的网站的通行证去登录scenter网站,
   * 如果都没有,就只能输入用户名和密码来登录了
   */
	public function actionLogin()
	{
	  if(Yii::app()->user->isGuest){
	    Yii::app()->scenter->loginApp();
      }else{
        $this->redirect(Yii::app()->homeUrl);
      }
	}
	
	/**
	 * 这个接口能让scenter 也logout, 
	 * 并且让下一次登录scenter必须到scenter网站去用regularLogin,
	 * 不能利用第三方app来登录,这是出于安全考虑
	 */
	public function actionLogout()
	{
	  $user=Yii::app()->user->model;
	  Yii::app()->user->logout();
	  $user->logout_at=time();
	  $user->save();
	  error_log("user(".$user->username.") logout",0);
	  //Yii::app()->scenter->logout();
	}
	
	/**
	 * 这是client已经从scenter网站取得ticket后返回的接口.
	 * 在这里当前app 把ticket交给scenter取得对应的马甲id,让client以该马甲登录当前app
	 */
	public function actionLoginByScenter()
	{
    list($username,$scenterUserid,$isgroup)=$_POST['SsysPassed'];
    $user=User::model()->findByAttributes(array('username'=>$username));
    if(!$user){
      $user=User::scenterCreate($username,$scenterUserid,$isgroup);
    }
    $returnUrl=Yii::app()->user->returnUrl;
    $this->redirect($returnUrl);
	}
	
	public function actionLoginByHand()
	{
	  $this->redirect("/site/login");
	}
	
	/**
	 * 这是scenter user注册当前网站马甲的接口
	 */
	public function actionRegister(){
	  list($username,$scenterUserid,$isgroup)=$_POST['SsysPassed'];
	  $user=User::scenterCreate($username,$scenterUserid,$isgroup);
	  $this->renderjson($user->username);
	}
	
	/**
	 * 在scenter注册app时用来检测一下
	 */
	public function actionIsApp(){
	  $hash=Yii::app()->request->getParam("hash");
	  $cleartext=Yii::app()->request->getParam("cleartext");
	  $salt=md5(Yii::app()->scenter->salt);
	  if($hash == md5($cleartext.$salt)){
	    echo 1;
	  }else{
	    echo 0;
	  }
	}
	
	/**
	 * 如果用户已经登陆了当前app,但是scenter没有登录,那么通过该接口能够自动登录scenter
	 * 如果该用户还没有注册scenter帐号,还会自动注册
	 */
	public function actionLoginScenter(){
	  if(Yii::app()->user->isGuest){
	    Yii::app()->scenter->regularLogin();
	  }else{
	    Yii::app()->scenter->loginScenter();
	  }
	}
	
	public function actionValidateHash(){
	  $hash=Yii::app()->request->getParam("hash");
	  $cleartext=Yii::app()->request->getParam("cleartext");
	  if(Yii::app()->scenter->clientValidateHash($hash,$cleartext)){
	    echo 1;
	  }else{
	    echo 0;
	  }
	  Yii::app()->end();
	}
}