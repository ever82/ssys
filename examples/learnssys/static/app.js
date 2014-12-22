$$.App.createSubclass({
    name:'learnssys'
},{
  xp_Layout:{
    mg_elementConfigs:{
      stage:["Html",['<div class="container"></div>']],
      navbar:["Navbar",{links:[['#',"<span class='fa fa-home'></span><span >Learn Ssys</span>"]]},{cssClass:"navbar-inverse navbar-fixed-top"}]
    },
    initShow:['navbar','stage']
  },
  xp_Resource:[{},{
    xp_Model:{
    },
    xp_ModelView:[{
    },{
    }],
    xp_CollectionView:{
    },
    xp_CreateView:{
    }
  }]
},"Learnssys");
window.learnssys=$$.App.Learnssys.create();