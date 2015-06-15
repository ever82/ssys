<?php
class CSsysTreeSubject extends CSsysTreeNode
{
  public $isSubject=true;
  const TreeNodeClass='Comment';//默认treenodeclass是评论
  
  public function getNodes(){
    $self=get_called_class();
    $treeNodeClass=$self::TreeNodeClass;
    return $treeNodeClass::model()->findAllByAttributes(array('subjecttype'=>$self,'subject_id'=>$this->id));
  }
  protected function _addIntimate($node){
    $self=get_called_class();
    $treeNodeClass=$self::TreeNodeClass;
    $this->descendantcount=$treeNodeClass::model()->countByAttributes(array('subject_id'=>$this->id,'subjecttype'=>$self));
    if(!$this->save()){
      $node->delete();
      throw new CException("因为数据库意外错误无法对它添加树节点");
    }
  }
  
  
  /**
   * implement Subject 的接口
   */
  public function getBranchNodes(){
    $self=get_called_class();
    $treeNodeClass=$self::TreeNodeClass;
    return $treeNodeClass::model()->findAllByAttributes(array('subjecttype'=>$self,'subject_id'=>$this->id,'is_branch'=>1));
  }
  /**
   * 返回所有亲节点
   */
  public function getIntimates(){
    $self=get_called_class();
    $treeNodeClass=$self::TreeNodeClass;
    return $treeNodeClass::model()->findAllByAttributes(array('subjecttype'=>$self,'subject_id'=>$this->id,'branch_id'=>null));
    
  }
  /**
   * 亲节点数
   */
  public function getIntimateCount(){
    $self=get_called_class();
    $treeNodeClass=$self::TreeNodeClass;
    return $treeNodeClass::model()->countByAttributes(array('subjecttype'=>$self,'subject_id'=>$this->id,'branch_id'=>null));
  }
  
  
  /**
   * 返回该主题的全部芽评论
   */
  public function getBudNodes(){
    $self=get_called_class();
    $treeNodeClass=$self::TreeNodeClass;
    return $treeNodeClass::model()->findAllByAttributes(array('subjecttype'=>$self,'subject_id'=>$this->id,'branch_id'=>null,'is_branch'=>0));
    
  }
  
  /**
   * 返回它的全部子节点
   */
  public function getChildren(){
    $self=get_called_class();
    $treeNodeClass=$self::TreeNodeClass;
    return $treeNodeClass::model()->findAllByAttributes(array('subjecttype'=>$self,'subject_id'=>$this->id,'parent_id'=>null));
  }
  
  public function getDescendantCount(){
    $self=get_called_class();
    $treeNodeClass=$self::TreeNodeClass;
    return $treeNodeClass::model()->countByAttributes(array('subjecttype'=>$self,'subject_id'=>$this->id));
    
  }
  
}
