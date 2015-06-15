<?php

class SsysBaseModelTest extends DbTestCase
{
	public $fixtures=array(
		'parties'=>'Party',
		'kases'=>'Kase',
		'users'=>'User',
		'verdicts'=>'Verdict',
	);
	
	public function testNoTypenameModel(){
	  $user1=$this->users('user1');
	  Yii::app()->user->id=$user1->id;
	  $title="testkase1";
	  $content="content1";
	  $kase=Kase::create($title,$content);
	  $this->assertNotNull($kase);
	  $this->assertEquals($kase->creator_id,$user1->id);
	  $attributesToSave=array("name"=>"testKase2");
	  $kase->attributes=$attributesToSave;
	  $kase->save();
	  $newKase=Kase::model()->findByPk($kase->id);
	  $this->assertEquals($newKase->name,"testKase2");
	}
	
	public function testTypenameModel(){
	  $user1=$this->users('user1');
	  Yii::app()->user->id=$user1->id;
	  $verdict=$this->verdicts('verdict1');
	  $verdict->truth=33;
	  $verdict->reason="hahaha";
	  $verdict->save();
	  $verdict=Verdict::model()->findByPk($verdict->id);
	  $this->assertEquals($verdict->truth,33);
	  $this->assertEquals($verdict->reason,"hahaha");
	  $attributesToSave=array("truth"=>90,"reason"=>"xxx");
	  $verdict->attributes=$attributesToSave;
	  $verdict->save();
	  $verdict=Verdict::model()->findByPk($verdict->id);
	  $this->assertEquals($verdict->truth,90);
	  $this->assertEquals($verdict->reason,"xxx");
	}
	
	public function testChangeTypename(){
	  $verdict=$this->changeFromPersonVerdictToWhatever();
	  $verdict=$this->changeFromWhateverToPersonVerdict($verdict);
	  $this->changeTypedataDirectly($verdict);
	}
	public function changeFromPersonVerdictToWhatever(){
	  $verdict=$this->verdicts('verdict1');
	  $this->assertEquals($verdict->typename,"PersonVerdict");
	  $attributesToSave=array("typename"=>"PersonWhateverVerdict","truth"=>90);
	  $verdict->attributes=$attributesToSave;
	  $verdict->save();
	  $newVerdict=Verdict::model()->findByPk($verdict->id);
	  $this->assertNull($newVerdict->reason);
	  $this->assertTrue($newVerdict instanceof PersonWhateverVerdict);
	  $this->assertEquals($newVerdict->typename,"PersonWhateverVerdict");
	  $this->assertEquals($newVerdict->truth,90);
	  return $newVerdict;
	}
	public function changeFromWhateverToPersonVerdict($verdict){
	  $this->assertEquals($verdict->typename,"PersonWhateverVerdict");
	  $attributesToSave=array("typename"=>"PersonVerdict","truth"=>90);
	  $verdict->attributes=$attributesToSave;
	  $verdict->save();
	  $newVerdict=Verdict::model()->findByPk($verdict->id);
	  $this->assertNull($newVerdict->reason);
	  $this->assertEquals($newVerdict->truth,90);
	  return $newVerdict;
	}
	
	public function changeTypedataDirectly($verdict){
	  $this->assertEquals($verdict->typename,"PersonVerdict");
	  $attributesToSave=array("typename"=>"PersonWhateverVerdict","truth"=>90,"reason"=>"ttt","typedata"=>array("hahahax"));
	  $verdict->attributes=$attributesToSave;
	  $verdict->save();
	  $newVerdict=Verdict::model()->findByPk($verdict->id);
	  $this->assertEquals($newVerdict->reason,"hahahax");
	  $this->assertTrue($newVerdict instanceof PersonWhateverVerdict);
	  $this->assertEquals($newVerdict->typename,"PersonWhateverVerdict");
	  $this->assertEquals($newVerdict->truth,90);
	  
	}
	
	
}
