<?php
class Valuation extends SsysBaseModel
{
  const MAXSATISFACTION=10;
  const MINSATISFACTION=-10;
  const inflectionPointY=2;
  /**
   * @const 配权的次数
   */
  const AdjustTimes=30;
  const WeightPercent=0.4;
  
  /**
   * @const int PRECISION 表示裁决结果曲线的精度,即x轴的划分数量,数量越大越精确 
   */
  const PRECISION=50;

  /**
   * 如果它是因scenter的更新而反馈回来的,就不要再setAnswer了
   */
  public $isUpdatingByScenter=false;
  protected $_curve;
  /**
   * 将被orverride
   */
  public function getAnswerTypedata(){
    //error_log("[error]getAnswerTypedata未orverride",0);
  }
  
  public function integrateAverageDiscreteGraph($answers){
    ////error_log("[info]开始合成加权的群体曲线,MetrizableAssignmentAnswer.integrateWeightedAverageDiscreteGraph",0);
    $minY=$this->minY;
    $maxY=$this->maxY;
    $precision=$this->precision;
    //error_log("[info]开始合成群体曲线,zone=($minY,$maxY,$precision) \n",0);
    $bestX=$this->getStartBestX($answers);
    $meanY=$this->getIntegratedY($answers,$bestX);
    $meanPoint=array($bestX,$meanY);
    //error_log("[info]找到近似的meanPoint作为起点:($bestX,$meanY) \n",0);
    $points=array($meanPoint);
    $step=1;
    list($leftX,$leftY)=$points[0];
    $i=0;
    while($leftY>$minY*self::Minpercent && $i<100){
      $testX=$leftX-$step;
      $testY=$this->getIntegratedY($answers,$testX);
      $distance=abs($testY-$leftY);
      $k=$distance/$precision;
      //error_log("[info]当前点为($leftX,$leftY),测试步宽为$step,找到测试点($testX,$testY),y轴距离为$distance,是精度的$k 倍 \n",0);
      if($k<0.5){
        $step=2*$step;
        $i++;
        continue;
      }else if($k>5){
        $step=$step/2;
        $i++;
        continue;
      }else if($k>=1 && $k<2){
        $newPoint=array($testX,$testY);
      }else{
        $objectiveY=($testY<$leftY)?($leftY-$precision):($leftY+$precision);
        //echo "testX=$testX,testY=$testY,leftX=$leftX,leftY=$leftY,step=$step \n";
        $objectiveX=$leftX+($leftX-$testX)/($leftY-$testY)*($objectiveY-$leftY);
        $nextIntegratedY=$this->getIntegratedY($answers,$objectiveX);
        $newPoint=array($objectiveX,$nextIntegratedY);
        $step=abs($leftX-$objectiveX);
      }
      array_unshift($points,$newPoint);
      //error_log("[info]添进新点(".$newPoint[0].",".$newPoint[1].") \n",0);
      $i++;
      list($leftX,$leftY)=$points[0];
    }
    list($rightX,$rightY)=end($points);
    $step=1;
    $i=0;
    while($rightY>$minY*self::Minpercent && $i<100){
      $testX=$rightX+$step;
      $testY=$this->getIntegratedY($answers,$testX);
      $distance=abs($testY-$rightY);
      $k=$distance/$precision;
      if($k<0.5){
        $step=2*$step;
        $i++;
        continue;
      }else if($k>5){
        $step=$step/2;
        $i++;
        continue;
      }else if($k>=1 && $k<2){
        $newPoint=array($testX,$testY);
      }else{
        $objectiveY=($testY<$rightY)?($rightY-$precision):($rightY+$precision);
        //echo "testX=$testX,testY=$testY,rightX=$rightX,rightY=$rightY,step=$step \n";
        $objectiveX=$rightX+($rightX-$testX)/($rightY-$testY)*($objectiveY-$rightY);
        $nextIntegratedY=$this->getIntegratedY($answers,$objectiveX);
        $newPoint=array($objectiveX,$nextIntegratedY);
        $step=abs($rightX-$objectiveX);
      }
      array_push($points,$newPoint);
      $i++;
      list($rightX,$rightY)=end($points);
    }
    return $this->roundPoints($points);
  }
  
  /**
   * 将被override
   */
  protected function _setGroupValuations(){
    
  }
  
    
  
  public function get3PointsExpectation($bestX,$leftPoint,$rightPoint){
    $meanPoint=array($bestX,self::MAXSATISFACTION);
    $leftHalf=$this->getFunctionParam($meanPoint,$leftPoint);
    $rightHalf=$this->getFunctionParam($meanPoint,$rightPoint);
    return array($bestX,$leftHalf,$rightHalf);
  }
  
  public function getFunctionParam($meanPoint,$point){
    list($x,$y)=$point;
    list($bestX,$meanY)=$meanPoint;
    if($y==$meanY){
      //那么这时的x=mean,所以给出的约束只有一点,无法确定曲线,
      //即这时求不出b值来
      return null;
    }
    $minY=self::MINSATISFACTION;
    $temp=log(($meanY-$minY)/($y-$minY));
    return pow(($x-$bestX),2)/$temp;
  }
  

}