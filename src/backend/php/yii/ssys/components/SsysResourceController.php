<?php
class SsysResourceController extends CController
{
	/**
	 * @var string the default layout for the views. Defaults to '//layouts/column2', meaning
	 * using two-column layout. See 'protected/views/layouts/column2.php'.
	 */
	public $layout='//layouts/column2';
	/**
	 * 表示资源是否私有, 如果否的话就公开可读,如果是的话就只有授权用户才能读取
	 */
	public $isPrivate=false;

	/**
	 * @var CActiveRecord the currently loaded data model instance.
	 */
	protected $_model;
	
  public function getPurifier(){
    $p = new CHtmlPurifier();
    $p->options = array(
      //'HTML.AllowedAttributes'=>array('a.href'),
      'URI.AllowedSchemes'=>array(
      'http' => true,
      'https' => true,
    ));
    return $p;
  }
  
  
	
  public function getModelClass(){
    return substr(get_class($this),0,-10);
  }
  
  public function loadModel()
  {
    if($this->_model===null)
    {
      if(isset($_REQUEST['id']))
        $this->_model=$this->resource->findbyPk($_REQUEST['id']);
      if($this->_model===null)
        throw new CHttpException(404,'The requested page does not exist.');
    }
    return $this->_model;
  }
  
  public function getResource(){
    return call_user_func(array($this->modelClass,'model'));
  }
  
  /**
   * 为了配合支持jsonp的前端,对于出错,不能直接throw exception,
   * 必须像返回正常结果一样返回信息,让前端代码去处理错误
   */
  public function renderError($errorMessage){
    $this->renderResult(array('error'=>$errorMessage));
  }
  
  
  
  /**
   * @return array action filters
   */
  public function filters()
  {
    return array(
      'isApp + appCreate,appUpdate,appDelete,appFetch',
      'isDeletable + delete',
      'isAdmin + deleteAll'
    );
  }
  /**
   * 对于要查找多个items时,都会用到分页条件,用该方法取得
   */
  public function getFindConditions(){
    //TODO order,condition存在安全问题
    $condition=isset($_REQUEST['condition'])?preg_replace('/[^a-zA-Z0-9*,_ ]+/', '', $_REQUEST['condition']):'';
    if(!isset($_REQUEST['returnsum'])){
      $page=intval(isset($_REQUEST['page'])?$_REQUEST['page']:1);
      $limit=intval(isset($_REQUEST['limit'])?$_REQUEST['limit']:20);
      $order=isset($_REQUEST['order'])?preg_replace("/[^a-zA-Z0-9*,_ ]+/", '', $_REQUEST['order']):'id';	  
      return array('limit'=>$limit,'offset'=>($page-1)*$limit,'order'=>$order,'condition'=>$condition);
    }else{
      array('condition'=>$condition);
    }
  }
  /**
   * render model列表
   */
  public function renderModels($models,$error="没有找到相关的models"){
    if(isset($models)){
      $tuples=array();
      foreach($models as $model){
        $tuples[]=$model->tuple;
        if($this->isPrivate&&!$model->isAuthorized()){
          throw new CHttpException(403,"你没有权限查看该资源");
        }
      }
    }else{
      $tuples=null;
    }
    $this->renderResult($tuples,$error);
  }
  
  
  
  public function renderModel($model,$error="没有找到对应的model"){
    if(isset($model)){
        if($this->isPrivate&&!$model->isAuthorized()){
          throw new CHttpException(403,"你没有权限查看该资源");
        }
        $result=$model->tuple;
    }else{
      $result=null;
    }
    $this->renderResult($result,$error);
  }
  
  public function renderResult($result,$error="没有找到相关资源"){
    if(isset($result)){
        $format=isset($_GET['format'])?$_GET['format']:'html';
        switch ($format) {
          case 'json':
            $this->renderjson($result);
            break;
          case 'jsonp':
            $this->renderjsonp($result);
            break;
          default:
            $this->render('view',array(
              'result'=>$result,
            ));
        }
    }else{
      $this->renderError($error);
    }
  }
  public function renderjsonp($result){
    echo "jsonp(".json_encode($result).")";
  }
  public function renderjson($result){
    //error_log("in renderjson, result=".json_encode($result),0);
    echo json_encode($result);
    //Yii::app()->end();
  }
  
  public function filterRequireLogin($filterChain){
    $user=Yii::app()->user;
    if($user->isGuest){
      $user->loginRequired();
    }
    $filterChain->run();
  }

  public function filterIsAdmin($filterChain){
    $user=Yii::app()->user;
    if($user->isGuest){
      $user->loginRequired();
    }
    if(!$user->isAdmin){
      throw new CHttpException(403,"只有在管理员才能使用该接口");
    }
    $filterChain->run();
  }
  
  public function filterIsApp($filterChain){
	  $pass=Yii::app()->request->getParam('SsysPass');
    if($pass==null){
      ////error_log("缺SsysPass参数",0);
      throw new CHttpException(403,"缺SsysPass参数");
    }
    list($sitename,$currenttime,$info,$hash)=json_decode($pass,true);
    //表示该pass的有效时间是6000秒左右
    if(abs(time()-$currenttime)>6000){
      ////error_log("SsysPass已经过时",0);
      throw new CHttpException(403,"SsysPass已经过时");
    }
    $cleartext=json_encode(array($sitename,$currenttime,$info));
    $app=App::model()->findByAttributes(array('name'=>$sitename));
    if(!$app){
      ////error_log("app=".$sitename."尚未注册",0);
      throw new CHttpException(403,"app=".$sitename."尚未注册");
    }
    if(!$app->validateHash($hash,$cleartext)){
      ////error_log("SsysPass验证失败",0);
      throw new CHttpException(403,"SsysPass验证失败");
    }
    $_POST['SsysPassed']=array($app,$info);
    $filterChain->run();
  }
  
  public function filterIsUpdatable($filterChain){
    $user=Yii::app()->scenter->currentUser;
    $model=$this->loadModel();
    if($model->creator_id!=$user->id&&!$user->isAdmin()){
      throw new CHttpException(403,"只有该model的创建者和管理员才能更新它");
    }
    $filterChain->run();
  }
  
  public function filterIsDeletable($filterChain){
    $user=Yii::app()->scenter->currentUser;
    $model=$this->loadModel();
    if($model->creator_id!=$user->id&&!$user->isAdmin()){
      throw new CHttpException(403,"只有该model的创建者和管理员才能删除它");
    }
    $filterChain->run();
  }
  
  
  public function actionDeleteAll(){
	  $valueSet=substr($ids=$_REQUEST['ids'],1,-1);
    $condition="id in ($valueSet)";
    if($this->resource->deleteAll($condition)){
      $this->renderResult('success');
    }else{
      $this->renderError('批量删除失败');
    }
    
  }
  
  
  /**
   * 返回该资源的总个数
   */
  public function actionSum(){
	  $this->renderResult(intval($this->resource->count()));
  }
  
  
	/**
	 * 返回一个item的一个属性的值
	 */
	public function actionAttri()
	{
	  $model=$this->loadModel();
	  $attri=$_GET['attri'];
	  if(($this->isPrivate&&!$model->isAuthorized())||!in_array($attri,$model->attris)){
        error_log("用户(".Yii::app()->user->name.")尝试越权查看数据".get_class($model)."(".$model->json.")的".$attri."属性",0);
        throw new CHttpException(403,"你没有权限查看该信息");
	  }
      $this->renderResult($model->{$attri});
	}
	
	/**
	 * 返回某model与当前登录用户的关系,用于判断是否有执行相关操作的权限
	 */
	public function actionGetRelationToCurrentUser(){
	  $model=$this->loadModel();
	  //error_log("[debug] model->id=".$model->id."\n",0);
	  $currentUser=Yii::app()->user->model;
	  $relation=$model->getRelationToUser($currentUser);
	  $this->renderResult($relation);
	}
	
	public function actionGetItemsByAttributes(){
	  $attris=json_decode($_REQUEST['attris'],true);
	  if(!isset($_REQUEST['returnsum'])){
	    $models=$this->resource->findAllByAttributes($attris,$this->findConditions);
	    $this->renderModels($models);
	  }else{
	    $this->renderResult(intval($this->resource->countByAttributes($attris,$this->findConditions)));
    }
	}
	
	public function actionGetItemsByAttributeValueSet(){
	  $valueSet=substr(Yii::app()->request->getParam('set'),1,-1);
	  $attributeName=$_REQUEST['attri'];
	  //error_log("[debug] attributeName=$attributeName\n",0);
	  if(!isset($_REQUEST['returnsum'])){
      $condition=$attributeName." in ($valueSet)";
      $models=$this->resource->findAll($condition);
      $this->renderModels($models);
	  }else{
	    $this->renderResult(count($valueSet));
    }
	}
	
	public function actionFindByAttributes(){
	  $attris=json_decode(Yii::app()->request->getParam('attris'),true);
	  $model=$this->resource->findByAttributes($attris);
      $this->renderModel($model);
	}
	
	public function actionView()
	{
	  ////error_log("[info][SsysResourceController.actionView]进入actionView,url=".Yii::app()->request->url,0);
	  Yii::log("hi","info","application.controller");
	  $model=$this->loadModel();
	  $this->renderModel($model);
	  ////error_log("[info][SsysResourceController.actionView]成功渲染了该页面,url=".Yii::app()->request->url,0);
	}
	
	/**
	 * Deletes a particular model.
	 * If deletion is successful, the browser will be redirected to the 'index' page.
	 */
	public function actionDelete()
	{
		if(Yii::app()->request->isPostRequest)
		{
			// we only allow deletion via POST request
			$this->loadModel()->delete();

			// if AJAX request (triggered by deletion via admin grid view), we should not redirect the browser
			if(!isset($_GET['ajax']))
				$this->redirect(array('index'));
		}
		else
			throw new CHttpException(400,'Invalid request. Please do not repeat this request again.');
	}
	
	/**
	 * Updates a particular model.
	 * If update is successful, the browser will be redirected to the 'view' page.
	 */
	public function actionUpdate()
	{
      $jsonParams=$_REQUEST['SsysUpdateParams'];
      $params = json_decode($jsonParams,true);
      $model=$this->loadModel();
      if(!$model->isUpdatable($params)){
        error_log("用户(".Yii::app()->user->name.")尝试越权修改数据".get_class($model)."(".$model->json.")",0);
        throw new CHttpException(403,"你没有权限去做这个更新");
      }
      if(isset($params['typename'])){
        $newTypename=$params['typename'];
        if($newTypename!=$model->typename){
          $model->typename=$newTypename;
          $model->save();
          $model=$this->loadModel();
        }
      }
      
      //Yii::log("before update,tuple=".json_encode($model->tuple)."\n","warning");
      $model->attributes=$params;
      //Yii::log("info=".json_encode($info)."\n","warning");
      if($model->save()){
        //Yii::app()->slog->info("更新成功","model->tuple=",$model->tuple);
        $this->renderResult($model->tuple);
      }else{
        
        throw new CHttpException(500,"failed to update the model");
      }
	}

	/**
	 * Updates a particular model.
	 * If update is successful, the browser will be redirected to the 'view' page.
	 */
	public function actionAppUpdate()
	{
	  $id=$_GET['id'];
      list($app,$info) = $_POST['SsysPassed'];
      $model=$this->loadModel();
      //Yii::log("before update,tuple=".json_encode($model->tuple)."\n","warning");
      $model->attributes=$info;
      //Yii::log("info=".json_encode($info)."\n","warning");
      if($model->save()){
        //Yii::log("tuple=".json_encode($model->tuple)."\n","warning");
        $this->renderResult("success");
      }else{
        throw new CHttpException(500,"failed to update the model");
      }
    }
    
    public function actionAppFetch(){
      list($app,$info) = $_POST['SsysPassed'];
      if(!is_array($info)){
        $info=array($info);
      }
      array_unshift($info,$app->id);
      $model = call_user_func_array(array($this->modelClass,'create'),$info);
      if($model){
        $this->renderResult($model->tuple);
      }else{
        //////error_log("创建model失败,请检查create时的参数是否正确,".json_encode($model->errors),3,"/home/f/temp/php_errors.log");
        throw new CHttpException(500,"创建model失败,请检查create时的参数是否正确,".json_encode($model->errors));
      }
	}
	
	public function actionAppCreate(){
      list($app,$info) = $_POST['SsysPassed'];
      if(!is_array($info)){
        $info=array($info);
      }
      array_unshift($info,$app->id);
      $model = call_user_func_array(array($this->modelClass,'create'),$info);
      $this->renderResult($model->id);
	  
	}

	public function actionCreate(){
	  //$jsonParams=$this->purifier->purify($_REQUEST['SsysCreationParams']);
      $jsonParams=$_REQUEST['SsysCreationParams'];
      $params = json_decode($jsonParams,true);
      if(!is_array($params)){
        $params=array($params);
      }
      $model = call_user_func_array(array($this->modelClass,'create'),$params);
      $this->renderModel($model,"创建".$this->modelClass."的model失败!请检查你是否有相关权限.");
    
	}
	
	public function actionAppDelete()
	{
	  $id=$_GET['id'];
      $model=$this->loadModel();
      $model->delete();
      $this->renderResult("success");
	}
	
	/**
	 * 判断value在attribute中是否独一无二的值 
	 */
	public function actionIsUnique(){
	  $attributeName=$_REQUEST['attr'];
	  $value=$_REQUEST['value'];
	  $model=$this->resource->findByAttributes(array($attributeName=>$value));
	  if($model){
	    $this->renderResult(false);
	  }else{
	    $this->renderResult(true);
	  }
	}
	
	
}