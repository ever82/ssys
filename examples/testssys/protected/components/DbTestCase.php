<?php
class DbTestCase extends SsysDbTestCase
{
  public $i=0;
  public $fixtures=array(
		'users'=>'User',
		'kases'=>'Kase',
		'verdicts'=>'Verdict',
		'rates'=>'Rate',
		'facts'=>'Fact',
		'opts'=>'Opt',
		'invitations'=>'Invitation',
		'raters'=>'Rater',
	);
  
  public function createInvitation($creator_id=1){
    return Invitation::create(1,$creator_id);
  }
	
	/**
	 * 随便添加一个kase
	 */
	public function createKase(){
	  $this->i++;
	  $i=$this->i;
	  if(!isset(Yii::app()->user->id)){
	    $this->ssyslogin();	  
	    $this->assertEquals(Yii::app()->user->name,"user1");	  
	  }else{
	    //echo "userid=".Yii::app()->user->id." username=".Yii::app()->user->name;
	  }
	  $defendant_username="d".$i;
	  $defendant_url="durl$i";
	  $item_name="itemname$i";
	  $item_url="iurl$i";
	  $bought_at=time();
	  $price=$i;
	  $shipping_fee=$i/20;
	  $delivered_at=time()+10000;
	  $problem="problem$i";
	  $defendant_response="response$i";
	  $found_at=time()+20000;
	  $returned_at=time()+33000;
	  $returned_fee=$i/20;
	  $claimed=$i*0.9;
	  $agreed=$i*0.5;
	  $fine=$i*2;
	  $kase=Kase::create($defendant_username,$defendant_url,$item_name,$item_url,$bought_at,$price,$shipping_fee,$delivered_at,$problem,$defendant_response,$found_at,$returned_at,$returned_fee,$claimed,$agreed,$fine);
	  $this->assertNotNull($kase);
	  return $kase;
	}
	
	public function createAVerdictingKase($points=30,$plaintiffUsername=null){
	  if(!isset($plaintiffUsername)){
	    $this->i++;
	    $plaintiffUsername="plaintiff".$this->i;
	  }
	  $this->ssyslogin($plaintiffUsername);
	  $plaintiff=Yii::app()->user->model;
	  $this->assertNotNull($plaintiff);
	  $plaintiff->points=$points;
	  $plaintiff->save();
	  $kase=$this->createKase();
	  $this->assertEquals($kase->status,'addingFacts');
	  $kase->ready();
	  $this->assertEquals($kase->status,'plaintiffReady');
	  $this->ssyslogin($kase->defendant_username);
	  $paidRaters=Rater::model()->countByAttributes(array("kase_id"=>$kase->id,"ispaid"=>1));
	  $this->assertEquals($paidRaters,0);
	  //users不足的时候要补足，不然没法抽样
	  $allUsers=User::model()->countByAttributes(array());
	  $this->ssyslogout();
	  for ($i=0; $i<100-$allUsers; $i++){
	    $this->createUser();
	  }
	  $this->ssyslogin('d'.$this->i);
	  $kase->ready();
	  $plaintiff->refresh();
	  return $kase;
	}
	
	public function createVerdict($kase,$username=null,$bestX=null,$invitationCode=null){
	  //echo "\ncreateVerdict, kase_id=".$kase->id.", username=$username\n";
	  $this->i++;
	  $i=$this->i;
	  if(!isset($username)){
	    $username="user$i".time();
	  }
	  $this->ssyslogin($username);
	  $this->assertEquals($username,Yii::app()->user->name);
	  $truth=rand(0,100);
	  if(!isset($bestX)){
	    $bestX=rand(0,5000);
	  }
	  $xs=$kase->getVerdictOpts($bestX);
	  $points=array();
	  foreach($xs as $i=>$x){
	    $points[$x]=rand(0,Verdict::MAXY);
	  }
	  $reason="reason".$i;
	  if(isset($invitationCode)){
	    $invitation=Invitation::findByCode($invitationCode);
	    $rater=Rater::assignByInvitation($invitation);
	  }else{
	    $rater=Rater::model()->findByAttributes(array("user_id"=>Yii::app()->user->id));
    }
    $verdict=Verdict::create($kase->id,$truth,$bestX,$points,$reason,$rater->id);
    $this->assertNotNull($verdict);
    $this->assertEquals($verdict->bestX,$bestX);
    return $verdict;
	}
	
	
}