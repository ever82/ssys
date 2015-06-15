<?php
class CSsysModelImplementation extends CComponent
{
  public $model;
  public $typedata;
  
  public function __construct($model){
    $this->model=$model;
    $typedata=$this->typedata=$model->typedata;
    $this->_construct($model,$typedata);
  }
  
  protected function _construct($model,$typedata){
  }
  
}