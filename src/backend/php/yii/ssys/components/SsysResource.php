<?php

class SsysResource
{
  public $implAttris;
  /**
   * 该资源的名称
   * @var string $name
   */
  public $name;
  
  /**
   * 表示该资源的单个data(相当于table的一行)包含的字段的名称
   * 根据这个可以从get返回的字符串中解码出对应的属性值
   * @var array $attributeNames
   */
  public $attributeNames;
  
  
  /**
   * 表示该资源所属的客户端
   * @var SsysClient $client
   */
  public $client;
  
  public function __construct($client,$name,$config){
    $this->client=$client;
    $this->name=$name;
    $this->attributeNames=$config['attributeNames'];
    $this->name1=1;
    if(isset($config['implAttris'])){
      //error_log("config['implAttris']=".json_encode($config['implAttris']),0);
      $this->implAttris=$config['implAttris'];
    }
    //error_log("this->implAttris=".json_encode($this->implAttris),0);
  }
  
  /**
   * 相当于create并返回整个item
   */
  public function fetch(){
    $param = func_get_args();
    $url="/".$this->name."/appFetch.json";
    $tuple=$this->client->securePost($url,$param);
    return new SsysItem($this->attributeNames,$tuple,$this);
  }
  
  public function create(){
    $param = func_get_args();
    $url="/".$this->name."/appCreate.json";
    return $this->client->securePost($url,$param);
  }
  
  public function update($id,$param){
    if(is_array($id)){
      $item=$this->findByAttributes($id);
      $id=$item->id;
    }
    $url="/".$this->name."/appUpdate/".$id.".json";
    return $this->client->securePost($url,$param);
  }
  
  /**
   * 删除$id对应的记录
   */
  public function delete($id){
    if(is_array($id)){
      $item=$this->findByAttributes($id);
      $id=$item->id;
    }
    $url="/".$this->name."/appDelete/".$id.".json";
    return $this->client->secureGet($url);
  }
  
  public function findByAttributes($attris){
    $attris=json_encode($attris);
    $url="/".$this->name."/findByAttributes.json?attris=".$attris;
    $result=$this->client->get($url);
    if(isset($result['error'])){
      return null;
    }else{
      return new SsysItem($this->attributeNames,$result,$this);
    }
  }
  
  public function getItem($id){
    $url="/".$this->name."/".$id.".json";
    $tuple=$this->client->get($url);
    return new SsysItem($this->attributeNames,$tuple,$this);
  }

  public function getItemByUrl($url,$param){
    $url="/".$this->name."/".$url;
    $tuple=$this->client->get($url,$param);
    return new SsysItem($this->attributeNames,$tuple,$this);
  }
  
  public function get($url,$param){
    $url="/".$this->name."/".$url;
    return $this->client->get($url,$param);
  }
  
  public function getAttri($itemId,$attributeName){
    $url="/".$this->name."/".$itemId."/".$attributeName.".json";
    return $this->client->get($url);
  }
}