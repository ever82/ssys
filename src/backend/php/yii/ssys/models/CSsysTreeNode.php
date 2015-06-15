<?php
class CSsysTreeNode extends SsysBaseModel
{
  const MaxCount=30;//一个节点成熟前能够拥有的最大亲节点数
  protected $_children=null;
  protected $_descendantCount=null;
  protected $_intimateCount=null;
  public $isSubject=false;
  const TreeNodeClass='';
  
  /**
   * 
   */
  public function refresh(){
    $this->_descendantCount=null;
    $this->_intimateCount=null;
    $this->_children=null;
    return parent::refresh();
  }
  
  
  /**
   * 添加一个亲节点
   */
  public function addIntimate($node){
    $this->extractBranch($node);
    $this->_addIntimate($node);
  }
  
  protected function _addIntimate($node){
    $self=get_called_class();
    $this->_addDescendant();
    if(!$this->save()){
      $node->delete();
      throw new CException("因为数据库意外错误无法对它添加树节点");
    }
  }
  
  /**
   * 处理子孙数
   */
  protected function _addDescendant(){
    $this->descendantcount=$this->getDescendantCount();
    $branch=$this->branch;
    while(isset($branch)){
      $branch->descendantcount=$branch->getDescendantCount();
      $branch->save();
      $branch=$branch->branch;
    }
    $subject=$this->subject;
    $subject->descendantcount=$subject->getDescendantCount();
    $subject->save();
  }
  /**
   * 返回一个节点的所有子孙的个数
   */
  public function getDescendantCount(){
    if(isset($this->_descendantCount)){
      return $this->_descendantCount;
    }else{
      $sum=0;
      $children=isset($this->_children)?$this->_children:$this->children;//如果是被layout了的,就不用再查找了
      foreach($children as $child){
        $sum=$sum+1+$child->getDescendantCount();
      }
      return $this->_descendantCount=$sum;
    }
  }
  
  
  /**
   * 返回该节点的主题
   */
  public function getSubject(){
    $subjecttype=$this->subjecttype;
    return $subjecttype::model()->findByPk($this->subject_id);
  }
  
  
  
  /**
   * 新添加$newNode, 如果亲节点刚好超过最大值, 就从中选出一个分支,
   * 如果选出分支之后亲节点数减少了, 那么该节点还未成熟
   * 极端的情况是虽然选出了分支, 但是亲节点数未减少,
   * 这时候已经可以认为该节点已经成熟, 这是一个尴尬的情况, 
   * 要等到下一次添加亲节点时, 才能把其余的亲节点都变成分支.
   * 也即亲节点刚好等于最大值+2时, 就要把其余的亲节点都变成分支.
   * 那么当亲节点再添加时,即亲节点数大于最大值+2时, 就直接把新添亲节点变成分支了
   */
  public function extractBranch($newNode){
    $intimateCount=$this->intimateCount;
    if($intimateCount==self::MaxCount+1){
      $branch=self::getBranch($this->intimates);
      $branch->setBranch();
    }else if($intimateCount==self::MaxCount+2){
      //当亲节点超过最大值时, 说明通过extractbranch已经没法减少亲节点数了,
      //这时$this就已经成熟了, 要将它的全部子节点都变成branch
      foreach($this->children as $child){
        if(!$child->is_branch){
          $child->setBranch();
        }
      }
    }else if($intimateCount>self::MaxCount+2){
      $newNode->setBranch();
    }
  }
  
  /**
   * 亲节点数
   */
  public function getIntimateCount(){
    $self=get_called_class();
    return $self::model()->countByAttributes(array('branch_id'=>$this->id));
  }
  
  
  
  /**
   * 在一堆节点中选出最适合被独立成分支的,
   * 用子孙数目和该点的价值评分作为参考, 
   * 目前算法就是采取这两者的乘积取最大的, 以后还可以优化
   */
  public static function getBranch($nodes){
    $maxRate=0;
    self::layout($nodes);
    foreach($nodes as $node){
      if(!$node->is_branch){
        $c=$node->_getIntimateCount();
        $walue=$node->walue;
        $rate=$c*(1+$walue);
        if($maxRate<$rate){
          $maxRate=$rate;
          $branch=$node;
        }
        if(!isset($branch)){
          $branch=$node;
        }
      }
    }
    return $branch;
  }
  
  /**
   * 返回将一堆节点$nodes 按照树形关系编排好位置, 返回最顶层的节点
   */
  public static function layout($nodes){
    $topNodes=array();
    $nodeIds=array();
    foreach ($nodes as &$node) {
      $nodeIds[] = $node->id;
    }
    foreach($nodes as &$node){
      /**
       * 当$node->parent_id 为空时, 它肯定是topnode
       * 当$node->parent_id 不为空, 但是在 $nodeIds 中找不到时, 它也是topnode
       */
      $node->_children=array();
      if(isset($node->parent_id)){
        $parentid=$node->parent_id;
        $i=array_search($parentid,$nodeIds);
        if($i===false){
          $topNodes[]=$node;
        }else{
          $parent=$nodes[$i];
          if(!isset($parent->_children)){
            $parent->_children=array();
          }
          $parent->_children[]=$node;
        }
      }else{
        $topNodes[]=$node;
      }
    }
    return $topNodes;
  }
  
  
  
  /**
   * 需要将其所有子孙节点的branch_id设为它的id 
   */
  public function setBranch(){
    $this->descendantcount=$this->getDescendantCount();   
    $this->is_branch=1;
    $this->save();
    $children=isset($this->_children)?$this->_children:$this->children;
    foreach($children as $child){
      $child->changeBranch($this->id);
    }
  }
  
  
  /**
   * 把$this和$this的子孙的branch都改成新的
   */
  public function changeBranch($branch_id){
    $this->branch_id=$branch_id;
    $this->save();
    $children=isset($this->_children)?$this->_children:$this->children;
    foreach($children as $i=>$child){
      $child->changeBranch($branch_id);
    }
  }
  
  /**
   * 返回该主题的全部分支节点
   */
  public function getBranchNodes(){
    $self=get_called_class();
    return $self::model()->findAllByAttributes(array('branch_id'=>$this->id,'is_branch'=>1));
  }
  
  
  /**
   * 返回一个节点的所有亲节点个数, 只有当它被layout之后才能用
   */
  protected function _getIntimateCount(){
    if(isset($this->_intimateCount)){
      return $this->_intimateCount;
    }else{
      $sum=0;
      foreach($this->_children as $child){
        $sum=$sum+1+$child->_getIntimateCount();
      }
      return $this->_intimateCount=$sum;
    }
  }
  
  /**
   * 返回所有亲节点
   */
  public function getIntimates(){
    $self=get_called_class();
    return $self::model()->findAllByAttributes(array('branch_id'=>$this->id));
  }
  
  /**
   * 返回该主题的全部芽节点
   */
  public function getBudNodes(){
    $self=get_called_class();
    return $self::model()->findAllByAttributes(array('branch_id'=>$this->id,'is_branch'=>0));
    
  }
    
  /**
   * 返回它的全部子节点
   */
  public function getChildren(){
    $self=get_called_class();
    return $self::model()->findAllByAttributes(array('parent_id'=>$this->id));
  }
  
  
  
  
  
}