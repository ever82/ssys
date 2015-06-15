pandingbao.addPage("index",{
    mg_elementConfigs:{
      complainBlock:['Html',['<div class="row text-center"></div>']],
      complainButton:['Button',["#kase/create","我要投诉",{size:"lg",type:"danger",cssClass:"col-xs-12 col-md-12"}],{wrapper:'<div style="display:table;width:100%;margin-bottom:10px">{{}}</div>'}],
      sellerComplainButton:['Button',["#kase/sellerComplain","我要投诉买家",{size:"lg",type:"success"}],{location:'complainBlock'}],
      moralStars:['${app.resources.user.CollectionView.MoralStars}'],
      verdictStars:['${app.resources.user.CollectionView.VerdictStars}'],
      myCurrentKases:['${app.resources.kase.CollectionView.MyCurrentKases}',null,{hide:'${isGuest}'}],
      beforeVerdictKases:['${app.resources.kase.CollectionView.BeforeVerdictKases}'],
      verdictingKases:['${cl~kase.VerdictingKases}'],
      convictedKases:['${cl~kase.ConvictedKases}']
    },
    initShow:['topbar','myCurrentKases.','verdictingKases.']
});
