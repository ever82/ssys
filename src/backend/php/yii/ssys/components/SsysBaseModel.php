<?php
class SsysBaseModel extends CActiveRecord
{
  protected $_implementation;
  protected $_typedata;
  protected $_typecodeChanged=false;

  public static function asserts($condition,$exception){
    if(!$condition){
      throw new CException($exception);
    }
  }
  
  public function assert($condition,$exception){
    if(!$condition){
      throw new CException($exception);
    }
  }
  public function afterFind(){
    parent::afterFind();
    if(isset($this->typename)){
      $this->impl();
    }
  }
  
  /**
   * 某些资源是不公开的,只有有权限的用户才能查看
   */
  public function isAuthorized(){
    $user=Yii::app()->user;
    return $this->creator_id==$user->id||$user->isAdmin();
  }
  
  
  /**
   * 在create中被调用,用来放一些特殊的创建逻辑
   */
  public function impl(){
    //error_log("检测是否进来了SsysBaseModel.impl,typename=".$this->typename,0);    
    if(isset($this->implAttris)){
      //error_log("检测implAttris=".json_encode($this->implAttris),0);
      $typedata=$this->typedata;
      //error_log("检测typedata=".json_encode($typedata),0);
      if(isset($typedata)){
        foreach($this->implAttris as $i=>$attr){
          if(isset($typedata[$i])){
              $this->$attr=$typedata[$i];
              //error_log("检测typedata[$i]=".json_encode($typedata[$i]),0);
              //error_log("检测this->$attr=".json_encode($this->$attr),0);
          }
        }
      }
    }
  }
  public function getCreator_username(){
    return $this->creator->username;
  }
  
  
  /**
   * 返回当前model跟$user的关系
   * @param User $user
   */
  public function getRelationToUser($user){
    if(isset($this->user_id)){
      if($user->id==$this->user_id){
        return "belongTo";
      }
    }
    return "none";
  }
  
  
  /*public function getImplementation(){
    if(!isset($this->_implementation)){
      //error_log("检测typename:".$this->typename,0);
      return $this->_implementation=new $this->typename($this);
    }else{
      return $this->_implementation;
    }
  }*/
  
  
  
  protected function afterValidate()
  {
    $errors=$this->errors;
    if($errors){
      //Yii::app()->slog->error(get_class($this)."model没通过验证","errors=",$errors);
      //error_log(get_class($this)." model errors:".json_encode($errors),0);
      //echo get_class($this)." model errors:".json_encode($errors)."\n";
      Yii::log("model errors:".json_encode($errors),"error","application.models");
    }
    //Yii::app()->slog->debug(get_class($this)."的model通过验证","errors=",$errors);
    return parent::afterValidate();
  }
  
  /**
   * @var array $temp,用来保存各种临时数据
   */
  public $temp=array();
  
  /**
   * @return array 返回属性名称列表,按这个顺序来生成item的json编码 
   */
  public function getAttris(){
    ////error_log("attris 还没有被该model class implement",0);
    throw new CException("attris 还没有被该model class implement");
  }
  
  public function getTuple($attris=null){
    $item=array();
    $attris=$attris?$attris:$this->attris;
    foreach($attris as $attri){
      $value=$this->{$attri};
      
      if(isset($this->metaData->columns[$attri]) && $this->metaData->columns[$attri]->dbType==="tinyint(1)"){
        $value=$value==='0'?0:1;
      }
      array_push($item,$value);
    }
    return $item;    
  }
  
  public function getJson(){
    $item=$this->tuple;
    //Yii::app()->slog->debug("进来getjson","item=",$item);
    return json_encode($item);
  }
    
  
  /**
   * 有新的评分, 需要更新数据
   */
  public function addRate($rate){
    $ratetype=$rate->ratetype;
    $this->_updateRate($ratetype);
    if(!$this->save()){      
      $rate->delete();
      throw new CException("因为数据库意外错误无法更新评分");
    }
  }
  
  public function updateRate($rate){
    $ratetype=$rate->ratetype;
    $this->_updateRate($ratetype);
    if(!$this->save()){      
      throw new CException("因为数据库意外错误无法更新评分");
    }
  }
  
  public function deleteRate($ratetype){
    $this->_updateRate($ratetype);
    if(!$this->save()){      
      throw new CException("因为数据库意外错误无法更新评分");
    }
  }
  
  protected function _updateRate($ratetype){
    $tmp=explode("__",$ratetype);
    $rateField=$tmp[1];
    $this->$rateField=Yii::app()->db->createCommand("select avg(walue) from {{rate}} where ratetype=:ratetype and object_id=:object_id;")->queryScalar(array(':object_id'=>$this->id,':ratetype'=>$ratetype));
    if(!$this->$rateField)$this->$rateField = 0; 
    $countField=$rateField."count";
    $this->$countField=Rate::model()->countByAttributes(array('object_id'=>$this->id,'ratetype'=>$ratetype));
    
  }
  
  public function isUpdatable($params){
    $user=Yii::app()->user;
    return $user->id==$this->creator_id || $user->isAdmin();
  }
  
  
  
	/**
	 * Returns the static model of the specified AR class.
	 * @return Question the static model class
	 */
	public static function model($className=null)
	{
	  $className=isset($className)?$className:get_called_class();
		return parent::model($className);
	}
}