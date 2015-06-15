<?php

class SsysClientTest extends DbTestCase
{
	public $fixtures=array(
		'verdicts'=>'Verdict',
		'kases'=>'Kase',
		'users'=>'User',
	);
	
	public function testSockpuppetLogic(){
	  
	}
	
	public function testClientResourceLogic(){
	  $user=$this->getItem();
	  $this->createItem();
	  $item=$this->findByAttributes();
	  $this->updateItem($item);
	}
	
	public function testScenterQuestionAnswerLogic(){
	  $questionid=$this->createQuestion();
	  $this->createUserAnswer($questionid);
	  $answersetid=$this->createAnswerset($questionid);
	  $answerid=$this->createIntegratedAnswer($questionid,$answersetid);
	  $this->updateQuestion($questionid,$answerid);
	}
	
	public function getItem(){
	  $user=Yii::app()->scenter->user->getItem(1);
	  $this->assertEquals($user->id,1);
	  $question=Yii::app()->scenter->question->getItem(1);
	  print_r($question);
	  return $user;
	}
	
	public function createItem(){
    $this->createQuestion();
	}
	
	public function findByAttributes(){
	  $item=Yii::app()->scenter->question->findByAttributes(array('app_id'=>1));
	  print_r($item);
	  $this->assertEquals($item->app_id,1);
	  return $item;
	}
	
	public function updateItem($item){
	  $this->updateQuestion($item->id,1);
	}
	
	
	public function createQuestion(){
	  $questiontype="ValuationQuestion";
    $a=20;
    $d=-10;
    $typedata=array($a,$d);
    $questionid=Yii::app()->scenter->question->create($questiontype,$typedata);
	  $this->assertTrue(is_numeric($questionid));
	  //$questionid=json_decode($questionid);
	  //$this->assertTrue(is_int($questionid));
	  return $questionid;
	}
	
	public function createUserAnswer($questionid){
    $user_id1=$this->users("user1")->id;
    $user_id2=$this->users("user2")->id;
    $expectation1=array(10000,1000,2000);
    $expectation2=array(20000,1600,3000);
    $answerid1=Yii::app()->scenter->userAnswer->create($questionid,$user_id1,$expectation1);
    $answerid2=Yii::app()->scenter->userAnswer->create($questionid,$user_id2,$expectation2);
	  $this->assertTrue(is_string($answerid1));
	  $answerid1=json_decode($answerid1,true);
	  $this->assertTrue(is_int($answerid1));
	  $this->assertTrue(($answerid1+1)==$answerid2);
	  $this->temp['answerid1']=$answerid1;
	  $this->temp['answerid2']=$answerid2;
	}
	
	public function createAnswerset($questionid)
	{
    $selectiontype="TotalSelection";
    $selectiondata=$questionid;
    $answersetid=Yii::app()->scenter->answerset->create($selectiontype,$selectiondata);
    //echo "answersetid=".$answersetid." \n";
	  $this->assertTrue(is_string($answersetid));
	  $answersetid=json_decode($answersetid,true);
	  $this->assertTrue(is_int($answersetid));
	  return $answersetid;
	}
	
	public function createIntegratedAnswer($questionid,$answersetid)
	{
	  $methodtype="AverageDiscreteGraph";
	  $from=0;
	  $to=50000;
	  $parts=10;
	  $methoddata=array($from,$to,$parts);
    list($answerid,$expectation)=Yii::app()->scenter->integratedAnswer->create($questionid,$answersetid,$methodtype,$methoddata);
    //echo "answerid=".$answerid.",expectation=".json_encode($expectation)." \n";
	  $this->assertTrue(is_string($answerid));
	  $answerid=json_decode($answerid,true);
	  $this->assertTrue(is_int($answerid));
	  //print_r($expectation);
	  $this->assertTrue(is_array($expectation));
	  return $answerid;
	}
	
	public function updateQuestion($questionid,$answerid){
	  echo "answerid=$answerid \n";
    $params=array('answertype'=>'IntegratedAnswer','answer'=>$answerid);
    $result=Yii::app()->scenter->question->update($questionid,$params);
    $this->assertEquals($result,'success');
    $question=Yii::app()->scenter->question->getItem($questionid);
    $this->assertEquals($question->answertype,'IntegratedAnswer');
    $this->assertEquals($answerid,$question->answer);
	}
}
