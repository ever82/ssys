<?php

class PersonSatisCurve extends CComponent
{
  const inflectionPointY=2;
  public $bestX;
  public $leftHalf;
  public $rightHalf;
  public $minY=-10;
  public $maxY=10;
  public $minX;
  public $maxX;
  public $weight;
  public $deviation;
  public $temp=array();
  function __construct($bestX=null,$leftHalf=null,$rightHalf=null,$weight=1){
    $this->bestX=$bestX;
    $this->leftHalf=$leftHalf;
    $this->rightHalf=$rightHalf;
    $this->weight=$weight;
    if(isset($rightHalf)){//说明它不是凭空创造的空壳,后者用于createByInflectionPoints等方法
      list($this->minX,$this->maxX)=$this->getX(self::inflectionPointY);
    }
  }
  public static function createBy3Points($bestX,$leftPoint,$rightPoint,$weight=1){
    $model=new self;
    list($bestX,$leftHalf,$rightHalf)=$model->get3PointsExpectation($bestX,$leftPoint,$rightPoint);
    return new self($bestX,$leftHalf,$rightHalf,$weight);
  }
  
  public static function createByInflectionPoints($bestX,$minX,$maxX,$weight=1){
    $model=new self;
    $leftPoint=array($minX,self::inflectionPointY);
    $rightPoint=array($maxX,self::inflectionPointY);
    list($bestX,$leftHalf,$rightHalf)=$model->get3PointsExpectation($bestX,$leftPoint,$rightPoint);
    return new self($bestX,$leftHalf,$rightHalf,$weight);
  }
  
  public function get3PointsExpectation($bestX,$leftPoint,$rightPoint){
    $meanPoint=array($bestX,$this->maxY);
    if($leftPoint){
      $leftHalf=$this->getFunctionParam($meanPoint,$leftPoint);
    }else{
      $leftHalf=$this->getFunctionParam($meanPoint,$rightPoint);
    }
    if($leftPoint){
      $rightHalf=$this->getFunctionParam($meanPoint,$rightPoint);
    }else{
      $rightHalf=$this->getFunctionParam($meanPoint,$leftPoint);
    }
    return array($bestX,$leftHalf,$rightHalf);
  }
  
  public function getFunctionParam($meanPoint,$point){
    list($x,$y)=$point;
    list($bestX,$meanY)=$meanPoint;
    $minY=$this->minY;
    $maxY=$this->maxY;
    if($y==$minY){
      $y=$minY*0.9;
    }else if($y==$maxY){
      $y=$maxY*0.99;
    }
    if($y==$meanY||$x==$bestX){
      //这时给出的约束只有一点,无法确定曲线,
      //即这时求不出b值来
      return null;
    }
    $temp=log(($meanY-$minY)/($y-$minY));
    return pow(($x-$bestX),2)/$temp;
  }
  
  /**
   * @param float $x
   * @return float 返回答案中对应$x值的$y值
   */
  public function getY($x){
    $b=$this->bestX;
    $c1=$this->leftHalf;
    $c2=$this->rightHalf;
    if($c1==0||$c1==null){
      $c1=$c2;
    }else if($c2==0||$c2==null){
      $c2=$c1;
    }
    $minY=$this->minY;
    $maxY=$this->maxY;
    $a=$maxY-$minY;
    if($x<$b){
      //Yii::log("in getY,x=$x,b=".$b.",c1=".$c1."\n","debug");
      $y=$a*exp(-pow(($x-$b),2)/$c1)+$minY;
    }else{
      //Yii::log("in getY,x=$x,b=".$b.",c2=".$c2."\n","debug");
      $y=$a*exp(-pow(($x-$b),2)/$c2)+$minY;
    }
    return $y;
  }
  
  public function getX($y,$a=null){
    $b=$this->bestX;
    $c1=$this->leftHalf;
    $c2=$this->rightHalf;
    $minY=$this->minY;
    $maxY=$this->maxY;
    if(!isset($a)){
      $a=$maxY-$minY;
    }
    $k1=sqrt($c1*log($a/($y-$minY)));
    $k2=sqrt($c2*log($a/($y-$minY)));
    //x1表示曲线左边的点的横坐标,所以它必须小于等于b
    $x1=$b-$k1;
    //x2表示曲线左边的点的横坐标,所以它必须大于等于b
    $x2=$k2+$b;
    return array($x1,$x2);
  }
  
}
