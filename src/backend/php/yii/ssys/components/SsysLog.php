<?php

class SsysLog extends CApplicationComponent
{  
  /**
   * 用来记录重要节点信息,形成清晰的程序流程
   */
  public function info(){
    $args=func_get_args();
    $str='';
    foreach($args as $arg){
      if(gettype($arg)=='string'){
        $str=$str.",".$arg;
      }else{
        $str=$str.",".json_encode($arg);
      }
    }
    error_log("[info]".$str,0);
  }

  public function debug(){
    $args=func_get_args();
    $str='';
    foreach($args as $arg){
      if(gettype($arg)=='string'){
        $str=$str.",".$arg;
      }else{
        $str=$str.",".json_encode($arg);
      }
    }
    error_log("[debug]".$str,0);
  }
  
  public function error(){
    $args=func_get_args();
    $str='';
    foreach($args as $arg){
      if(gettype($arg)=='string'){
        $str=$str.",".$arg;
      }else{
        $str=$str.",".json_encode($arg);
      }
    }
    error_log("[error]".$str,0);
    throw new CException($str);
  }
  
  
}