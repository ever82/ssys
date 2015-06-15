<?php
class SsysItem
{
  public $attris;
  public $implAttris;
  public $tuple;
  public $resource;
  public function __construct($attris,$tuple,$resource){
    $this->attris=$attris;
    $this->tuple=$tuple;
    $this->resource=$resource;
    @$implAttris=$resource->implAttris;
    @$this->implAttris=$implAttris[$this->typename];
  }
  
	function __get($name)
	{
		$key=array_search($name, $this->attris);
		if($key!==false){
			return $this->tuple[$key];
		}else if(isset($this->implAttris)){
		  $key=array_search($name, $this->implAttris);
		  if($key!==false){
		    $typedata=$this->typedata;
		    return $typedata[$key];
		  }
		}
		return null;
	}
	
	public function update($attris){
	  $this->resource->update($this->id,$attris);
	}
	
	
}