<?php
/**
 * 群体满意度曲线
 */
class GroupSatisCurve extends CComponent
{
  public $bottomPercent;
  public $minY;
  public $maxY;
  public $precision;
  public $points;
  public $bestX;
  public $bestY;
  public $weight;
  public $bottom;
  public $personCurves;
  public $bestPoint;
  public $adjustTimes=1;
  public $yRatio;
  public $step;
  public $weightT;//配权系数,配权时算出来的一个数值
  public $deviationR;//偏差系数
  public $temp=array();//用来保存一些临时数据
  
  /**
   * @param array $points 表示当前群体曲线合成的点, 以x坐标为key,y坐标为value 
   */
  function __construct($personCurves,$minY=-10,$maxY=10,$precision=100,$bottomPercent=0.05){
    $this->personCurves=$personCurves;
    $this->minY=$minY;
    $this->maxY=$maxY;
    $this->precision=$precision;
    $this->bottomPercent=$bottomPercent;
    $this->bottom=$minY+($maxY-$minY)*$bottomPercent;
    $this->weight=$this->getWeight();
    $this->integratePersonCurves();
    $sum0=0;
    $adjustedTimes=0;
    while($adjustedTimes<$this->adjustTimes){
      $this->updateDeviations();
      $sum=$this->adjustWeights();
      if($sum==$sum0){
        break;
      }else{
        $sum0=$sum;
      }
      //$this->integratePersonCurves();
      $adjustedTimes++;
    }
    //error_log("实际配权了 $adjustedTimes 次",0);
  }
  
  
  
  public function getBestPoint(){
    $points=$this->points;
    $y=max($points);
    $x=array_search($y,$points);
    return array($x,$y);
  }
  
  /**
   * 返回最满意的x值
   */
  public function getBestX(){
    //Yii::app()->slog->info("in getBestX","bestPoint=",$this->bestPoint);
    return $this->bestPoint[0];
  }
  
  
  
  /**
   * 求出群体曲线的总权重
   */
  public function getWeight(){
    $weight=0;
    foreach($this->personCurves as $curve){
      $weight+=$curve->weight;
    }
    return $weight;
  }
  
  /**
   * 合成多个个人曲线
   */
  public function integratePersonCurves1(){
    $points=array();
    foreach($this->personCurves as &$personCurve){
      $x=$personCurve->bestX;
      $y=0;
      if(isset($points[$x])){
        continue;
      }
      foreach($this->personCurves as $i=>&$personCurve2){
        $weight=$personCurve2->weight;
        if($i=0){
          //error_log("weight2=$weight",0);
        }
        $y+=$personCurve2->getY($x)*$weight;
      }
      $y=$y/$this->weight;
      if($y>$this->bottom){
        $points[$x]=$y;
      }
    }
    $this->points=$points;
    $this->bestPoint=$this->getBestPoint();
    $bestX=$this->bestX=$this->bestPoint[0];
    
    if($bestX!=0){
      $leftX=0;
      $rightX=2*$bestX;
    }else{
      $finalBottom=$this->getFinalBottom($points);
      $points2=array();
      foreach($points as $x=>$y){
        if($y>$finalBottom){
          $points2[$x]=$y;
        }
      }
      $keys=array_keys($points2);
      //error_log("keys=".json_encode($keys),0);
      $leftX=$keys[0];
      $rightX=end($keys);
    }
    $leftRange=$bestX-$leftX;
    $rightRange=$rightX-$bestX;
    $finalPoints=array();
    $finalPoints[$leftX]=$this->getY($leftX);
    $finalPoints[$rightX]=$this->getY($rightX);
    for($i=0,$l=2; $i<$l; $i++){
      $x=$leftX+$leftRange/$l*($i+1);
      $y=$this->getY($x);
      $finalPoints[$x]=$y;
    }
    for($i=0,$l=2; $i<$l; $i++){
      $x=$bestX+$rightRange/$l*($i+1);
      $y=$this->getY($x);
      $finalPoints[$x]=$y;
    }
    $this->bestY=$this->bestPoint[1];
    $this->points=$finalPoints;
    $this->yRatio=20/($this->bestY+10);
  }
  /**
   * 合成多个个人曲线
   */
  public function integratePersonCurves(){
    $points=array();
    foreach($this->personCurves as &$personCurve){
      $x=$personCurve->bestX;
      $y=0;
      if(isset($points[$x])){
        continue;
      }
      foreach($this->personCurves as $i=>&$personCurve2){
        $weight=$personCurve2->weight;
        if($i=0){
          //error_log("weight2=$weight",0);
        }
        $y+=$personCurve2->getY($x)*$weight;
      }
      $y=$y/$this->weight;
      if($y>$this->bottom){
        $points[$x]=$y;
      }
    }
    $this->points=$points;
    $this->bestPoint=$this->getBestPoint();
    $bestX=$this->bestX=$this->bestPoint[0];
    //添加配权的点
    $points[0]=$this->getY(0);
    $points[2*$bestX]=$this->getY(2*$bestX);
    list($leftX,$rightX)=$this->getX($this->bottom,1);
    $leftRange=$bestX-$leftX;
    $rightRange=$rightX-$bestX;
    $this->temp['points']=array();//这些点不用保存,但是可以用来求反函数
    $l=1000;
    $leftStep=$this->temp['leftStep']=$leftRange/$l;
    $rightStep=$this->temp['rightStep']=$rightRange/$l;
    for($i=0; $i<$l; $i++){
      $x=$leftX+$leftStep*$i;
      $y=$this->getY($x);
      $this->temp['points'][$x]=$y;
      if($i % ($l/10)===0){
        $points[$x]=$y;
      }
    }
    for($i=0; $i<$l; $i++){
      $x=$bestX+$rightStep*($i+1);
      $y=$this->getY($x);
      $this->temp['points'][$x]=$y;
      if($i % ($l/10)===0){
        $points[$x]=$y;
      }
    }
    ksort($this->temp['points']);
    $this->bestY=$this->bestPoint[1];
    $this->yRatio=20/($this->bestY+10);
    $this->points=$points;
  }
  
  /**
   * 根据y求出对应的左右x
   */
  public function getX($y,$precision=0.5){
    $bestX=$this->bestX;
    $step=abs($bestX);
    if($step==0){
      $step=1;
    }
    $leftStep=isset($this->temp['leftStep'])?$this->temp['leftStep']:$step;
    $rightStep=isset($this->temp['rightStep'])?$this->temp['rightStep']:$step;
    list($leftX,$leftY)=$this->getPointNearY($y,-$leftStep,$this->bestPoint,$precision);
    list($rightX,$rightY)=$this->getPointNearY($y,$rightStep,$this->bestPoint,$precision);
    return array($leftX,$rightX);
  }
  
  /**
   * $step可以为负,它为正表示向右边找,为负表示向左边找
   */
  public function getPointNearY($y,$step,$point0,$precision){
    $step0=$step;
    $x0=$point0[0];
    $y0=$point0[1];
    $dy00=$dy0=abs($y-$y0);
    if($dy0<=$precision){
      return $point0;
    }
    $points=$this->temp['points'];
    if(isset($points)){
      foreach($points as $x1=>$y1){
        if($step>0){
          //需要找x0右边的点
          if($x1<$point0[0]){
            continue;
          }
        }else{
          //需要找x0左边的点
          if($x1>$point0[0]){
            continue;
          }
        }
        $dy1=abs($y-$y1);
        if($dy1<=$precision){
          return array($x1,$y1);
        }else if($dy1<$dy0){
          $x0=$x1;
          $y0=$y1;
          $dy0=$dy1;
        }
      }
      return array($x0,$y0);//不能保证能找到精度内的,只能保证找到最接近的
    }
    $x2=$x0;
    $y2=$y0;
    $dy2=$dy0;
    $dy=$dy0;
    $i=0;
    while($dy>$precision&&$i<1000){
      $i++;
      $dy0=$dy;
      $x1=$x0;
      $y1=$y0;
      $x0=$x0+$step;
      $y0=$this->getY($x0);
      $dy=abs($y-$y0);
      if($dy>$dy0){
        $x0=$x1;
        $y0=$y1;
        $dy=$dy0;
        if((($y1-$y)*($y0-$y))<0){
          //说明过了头,step要变小,从上一个点重新开始找
          $step=$step*0.1;
        }else{
          //说明遇到非单调的情况了,加大step,从上一个点重新开始找,跳过这个峰
          $step=$step*2;
        }
      }/*else if($dy0-$dy<$precision){
        //说明step太小,需要加大步伐
        $step=2*$step;
      }*/
    }
    if($i==1000){
      throw new CException("x2=$x2,y2=$y2,dy2=$dy2,$points,precision=$precision,point0=(".$point0[0].",".$point0[1]."),step0=".$step0.",最后找到的点是($x0,$y0),($x1,$y1), 需要找的y=$y,最后step=$step,dy=$dy");
    }
    return array($x0,$y0);
  }
  
  
  
  
  public function getFinalBottom($points){
    ksort($points);
    $i=0;
    $keys=array_keys($points);
    $leftY=$points[$keys[0]];
    //error_log("leftY=$leftY",0);
    $rightY=end($points);
    //error_log("rightY=$rightY",0);
    return $bottom=max($leftY,$rightY);
  }
  
  
  
  public function updateDeviations(){
    $points=$this->points;
    $bestPoint=$this->bestPoint;
    $minY=$this->minY;
    /**
     * @var $k 值表示将群体满意度曲线拉长到跟个人满意度曲线统一的坐标的比例
     */
    $k=($this->maxY-$minY)/($bestPoint[1]-$minY);
    foreach($points as $x=>$y){
      $points[$x]=($y-$minY)*$k+$minY;
    }
    $deviation=0;
    $deviations=array();
    foreach($this->personCurves as &$curve){
      $deviation+=$d=$this->_getDeviation($curve,$points,'3PointsXAxis');
      $deviations[]=$d;
    }
    $averageDeviation=$deviation/count($this->personCurves);
    $ratio=$averageDeviation/10;
    $maxD=max($deviations);
    $minD=min($deviations);
    $this->deviationR=$averageDeviation/($maxD-$minD);
    foreach($this->personCurves as &$curve){
      $curve->deviation=$curve->deviation/$ratio;
    }
    
  }
  
  
  protected function _getDeviation(&$personCurve,$points,$algorithm){
    $length=count($points);
    
    switch ($algorithm) {
      case "3PointsXAxis":
        if(isset($this->temp['x0'])){
          $x0=$this->temp['x0'];
          $x1=$this->temp['x1'];
          $y0=$this->temp['y0'];
          $y1=$this->temp['y1'];
        }else{
          list($x0,$x1)=$this->getX(0,0.2);
          $this->temp['x0']=$x0;
          $y0=$this->temp['y0']=$this->getY($x0);
          $this->temp['x1']=$x1;
          $y1=$this->temp['y1']=$this->getY($x1);
        }
        $xRange=$x1-$x0;
        //用它将x轴放缩成跟y轴差不多的长度
        //$k=$xRange/10;
        //$i=0;
        //$effectualPoints=0;
        $maxY=$this->maxY;
        $variation=2*pow(($this->bestX-$personCurve->bestX),2);
        //$zeroY=10*$this->yRatio-10;//求出群体曲线的y=0的点对应在个人曲线上的y值
        //(y1a-y1b)/(y0a-y0b)=yratio,y0a=maxY,y1a=10,y0b=$y0和$y1,求y1b
        //y1b=y1a-yratio*(y0a-y0b);
        $zeroY0=10-$this->yRatio*($maxY-$y0);
        $zeroY1=10-$this->yRatio*($maxY-$y1);
        list($px0,$tmp)=$personCurve->getX($zeroY0);
        list($tmp,$px1)=$personCurve->getX($zeroY1);
        $variation+=pow(($x0-$px0),2);
        $variation+=pow(($x1-$px1),2);
        $deviation=sqrt($variation/4);
        //error_log("xAxis,deviation=$deviation",0);
        break;
      case "3PointsMixed":
        if($this->bestX!=0){
          $leftX=0;
          $rightX=2*$this->bestX;
          $xRatio=$this->bestX/5;
        }else{
          $xList=array_keys($points);
          $leftX=min($xList);
          $rightX=max($xList);
          $xRange=$rightX-$leftX;
          $xRatio=$xRange/10;
        }
        $dy=($points[$leftX]+10)/$this->yRatio-$personCurve->getY($leftX)-10;
        $dz=($points[$rightX]+10)/$this->yRatio-$personCurve->getY($rightX)-10;
        $deviation=sqrt((2*pow(($this->bestX-$personCurve->bestX)/$xRatio,2)+pow($dy,2)+pow($dz,2))/3);
        break;
      case "XAxis":
        $xList=array_keys($points);
        $xRange=max($xList)-min($xList);
        $yRange=$this->maxY-$this->minY;
        //用它将x轴放缩成跟y轴差不多的长度
        $k=$xRange/$yRange;
        //$i=0;
        //$effectualPoints=0;
        $maxY=$this->maxY;
        $variation=0;
        foreach($points as $x=>$y){
          list($x1,$x2)=$personCurve->getX($y);
          if($x<=$this->bestX){
            //这时取左边的点
            $variation+=pow(($x1-$x)/$k,2);
          }else{
            $variation+=pow(($x2-$x)/$k,2);
          }
        }
        $deviation=sqrt($variation/$length);
        //error_log("xAxis,deviation=$deviation",0);
        break;
      case "YAxis":
        $variation=0;
        $ratio=$this->yRatio;
        foreach($points as $x=>$y){
          $y1=$personCurve->getY($x);
          $variation+=pow(($y1-$y*$ratio),2);
        }
        $deviation=sqrt($variation/$length);
        //error_log("yAxis,deviation=$deviation",0);
        break;
      case "Mixed":
        $deviation1=$this->_getDeviation($personCurve,$points,"XAxis");
        $deviation2=$this->_getDeviation($personCurve,$points,"YAxis");
        $deviation=($deviation1+$deviation2)/2;
        break;
    }
    return $personCurve->deviation=$deviation;
  }
  
  
  /**
   * 假设有N个成员参与了裁决，
   * 每个成员的自身权重及他的裁决曲线与群体裁决曲线的标准方差分别为
   * Q1,Q2,Q3,- - - Qn.和b1,b2,b3,...,bn,bi*Qi=ai, 得到a1,a2,a3,- - - - an.其中如k>h则ak>ah 。
   * 依下式求出t的数值
   * t=ΣQm/Σ[(am-an)/(a1-an)·Qm]
   * 为了避免成员权重的大起大落，
   * 假设每次裁决每个成员只利用40%的权重来参与重新调整，
   * 那么经过该次裁决后，
   * 第m个成员的权重由原来的Qm调整为0.8·Qm+0.2·[t·(an-am)/(an-a1)·Qm]
   */  
  public function adjustWeights(){
    $percent=0.2;
    $sum=0;
    $alist=array();
    foreach($this->personCurves as $key=>&$curve){
      $aList[]=$curve->deviation*$curve->weight;
    }
    //error_log("curve->weight=".$curve->weight,0);
    //error_log("curve->deviation=".$curve->deviation,0);
    $maxA=max($aList);
    $minA=min($aList);
    foreach($this->personCurves as $i=>&$curve){
      $sum+=$curve->temp["k"]=($aList[$i]-$maxA)/($minA-$maxA)*$curve->weight;
    }
    //error_log("sum=$sum",0);
    //error_log("curve[k]=".$curve->temp["k"],0);
    $this->weightT=$t=$this->weight/$sum;
    
    //error_log("t=$t",0);
    foreach($this->personCurves as $i=>&$curve){
      $weight=$curve->weight;
      //error_log("before adjust, weight=$weight,k=".$curve->temp["k"],0);
      $curve->weight=$weight*(1-$percent)+$percent*$t*$curve->temp["k"];
      //error_log("weight=$curve->weight",0);
    }
    return $sum;
  }  
  
  
  /**
   * 在现有基础上添加一个个人满意度曲线
   * @param PersonSatisCurve $personSatisCurve
   */
  public function addPersonSatisCurve($personSatisCurve){
    $points=$this->points;
    $newX=$personSatisCurve->bestX;
    if(isset($points)){
      foreach($points as $x=>$y){
        $points[$x]=$this->getYWithNewCurve($x,$personSatisCurve);
      }
      if(!isset($points[$newX])){
        $newY=$this->getYWithNewCurve($newX,$personSatisCurve);
        $this->addPoint($newX,$newY);
      }
    }else{
      $newY=$personSatisCurve->getY($newX);
      $points=array($newX=>$newY);
    }
    $this->personCurves[]=$personSatisCurve;
    $this->weight+=$personSatisCurve->weight;
  }
  
  /**
   * 在现有基础上减少一个个人满意度曲线
   */
  public function removePersonSatisCurve($personSatisCurve){
    $points=$this->points;
    $personCurves=$this->personCurves;
    $key=array_search($personCurves);
    array_splice($personCurves,$key,1);
    if(isset($points)){
      $newX=$personSatisCurve->bestX;
      $newY=$this->getY();
    }else{
      
    }
  }
  
  /**
   * 给 $this->points 添加一个点
   */
  public function addPoint($x,$y){
    if($y<$this->bottom){
      return null;
    }
    $this->points[$x]=$y;
    ksort($this->points);
  }
  
  /**
   * 返回 $points 所有点中y坐标轴与$y相邻的上下4个点, 下面两个点和上面两个点,
   * 返回顺序是从小到大排列的
   */
  public function getNeighbors($y){
    
  }
  
  
  
  /**
   * 将 x坐标为$x的点从 $this->points 去掉
   */
  public function removePoint($x){
    unset($this->points[$x]);
  }
  
  /**
   * 返回由 $this->personCurves 合成的群体曲线在x坐标上$x对应的y值
   */
  public function getY($x){
    if(isset($this->points[$x])){
      return $this->points[$x];
    }else{
      $curves=$this->personCurves;
      $y=0;
      foreach($curves as $curve){
        $weight=$curve->weight;
        $y+=$curve->getY($x)*$weight;
      }
      return $y/$this->weight;
    }
  }
  
  
  /**
   * 新添加个人曲线 $newCurve 之后合成的群体曲线在x坐标上$x对应的y值
   */
  public function getYWithNewCurve($x,$newCurve){
    $oldY=$this->getY($x);
    $y=$newCurve->getY($x);
    $weight0=$this->weight;
    $weight1=$newCurve->weight;
    return ($oldY*$weight0+$y*$weight1)/($weight0+$weight1);
  }
  
  
}