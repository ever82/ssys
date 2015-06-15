ssys.pandingbao.addViewClass("tutorial",{
    style:'tutorialPage',
    mg_elementConfigs:{
      introduction:['Dom',['h3',null,null,'请选择你的目的']],
      introduction2:['Dom',['h5',null,null,'(10秒钟后程序会自动选择第一项)']],
      roamLink:['ImageLink',['roam','${imgUrl}roam.gif',null,null,null,'我想了解概况']],
      addKaseLink:['ImageLink',['addKase',
        '${imgUrl}addKase.gif',null,null,null,'我有纠纷, 需要仲裁']]
    },
    mg_showConfigRules:[
      [/^$|index/,[['导航','请点击图片选择你的目的']]]
    ],
    nextStepsConfigRules:[
      [/^$|index/,[['roam'],['addKase']]]
    ],
    tipsConfigs:{
      index:[
        {location:'roamLink',delay:2},
        {location:'addKaseLink'}]
    },
    indexShow:['introduction','roamLink','addKaseLink'],
    beforeInit:function(){      
          this.parentCall("beforeInit");
          this.imgUrl = this.app.staticBaseUrl+"img/";            
    },
    filter_addKase:function(state){
      var options={
          position: {
            my: "center bottom-20",
            at: "center+100 top-50"
          }
      };
      return ssys.reject({view:this.app.layout,playList:[
        {state:"groups",label:'选择版块',title:"在这里选择你的纠纷所属的群体",seconds:26,
          tips:[
            {content:'点击能进入该群体, 然后就能在该群体中添加你的纠纷投诉了',location:'.ssysModelList .ssysUserLink:first',delay:2,duration:4},
            {content:'如果你不做出选择, 20秒后程序会自动选择其它纠纷这个群',location:".ssysModelList .ssysUserLink :contains('其它纠纷')"}
            ]},
        {
          optionRules:
          [
            [
              /^groups\/(\d+)/,
              [
                {
                  state:"groups/$1",title:"你选择了在群体$1添加投诉",seconds:10,
                  tips:
                  [
                    {
                      location:".ui-menu-item a[name='$1/groupKases/create']",
                      content:'点击这里开始添加投诉, 或者等10秒钟后程序自动开始添加投诉',delay:2,
                      options:{position:{my:"top",at:"bottom"}}
                    }
                  ]
                },
                {
                  state:"groups/$1/groupKases/create",title:"在群体$1添加投诉",seconds:-1,
                  tips:
                  [
                    {
                      location:"#pandingbao_default__groups__modelView$1__groupKases__create__contentInput",
                      content:'尽量用客观公正的语句来简单描述大致案情, 详细的案情交给后面的案情讨论环节',delay:3
                    }
                  ]
                },
                {
                  optionRules:[
                    [/^kaseResource\/(\d+)/,
                      [
                        {state:"kaseResource/$1",title:"你成功添加了投诉",seconds:-2,
                        tips:[
                          {content:"这就是你刚刚添加投诉",delay:2},
                          {content:"本次导航结束了"}
                        ]},
                        {state:"kaseResource/$1/parties/create"}
                      ]
                    ]
                  ],
                  state:"groups/$1/refresh"
                },
                //{state:"tutorial",title:"本次导航结束了",seconds:-2}
              ]
            ]  
          ],state:"groups/155"
        }
      ]});
    },
    filter_roam:function(state){
      var options={
          position: {
            my: "center center",
            at: "center center"
          }
      };
      return ssys.reject({view:this.app.layout,playList:[
        {state:"groups",label:'纠纷群体',preventClick:'confirm',title:"",seconds:30,
          tips:[
            {content:'我们把纠纷按其所属的群体分版块'},
            {content:'这里是所有纠纷群体列表'},
            {location:'.ssysModelList .ssysUserLink:eq(0)',content:'点击能进入该群体, 查看群体内的历史投诉',options:options},
            {content:'如果你有需要解决的纠纷, 也可以选择进入相应的群体去添加投诉'},
            {location:'.ui-menu-item a[name=create]',content:'如果没找到合适的群体, 你也可以点击这里添加一个群体',options:{position:{my:"top",at:"bottom"}}},
            {location:'.ssysModelList .ssysUserLink:eq(0)',content:'我们先到这个群体看看'}
          ]
        },
        {state:"groups/148",label:"公正圈",title:"",seconds:30,
          tips:[
            {content:'这是公正圈主页, 是专门处理公正圈内的纠纷的地方'},
            {content:'目前一个群体主页的内容还很少, 只有群体简介,以及该群体内的纠纷投诉列表'},
            {content:'以后还会增加一个群体内的赏罚项目, 各种统计数据'},
            {content:'这是一个投诉的标题',location:'.ssysModelList .ssysModelView .ssysLink:visible:eq(0)',duration:2},
            {content:'点击能进入该投诉',location:'.ssysModelList .ssysModelView .ssysLink:visible:eq(0)',duration:2},
            {content:'我们进入这个投诉看看',location:'.ssysModelList .ssysModelView .ssysLink:visible:eq(0)',duration:2}
          ]
        },
        {state:"kaseResource/1",label:"投诉1",title:"这是一个还在处于案情讨论阶段的投诉",seconds:150,
          tips:[
            {view:'kaseResource__modelView1'}  
          ]
        },
        {state:"kaseResource/3",label:"投诉3",title:"我们接下来看一个已经进入判定阶段的投诉",seconds:25,
          tips:[
            {content:'可以看到被告右边的图标变成了一个小喇叭',location:"a[name='myVerdict']:visible:eq(0)",delay:4},
            {view:'kaseResource__modelView3__parties__modelList__modelListView5',duration:15}
          ]
        },     
        {state:"kaseResource/7",label:"投诉7",title:"最后我们看看一个已经宣判的投诉",seconds:50,
          tips:[
            {view:'kaseResource__modelView7__parties',delay:2}
          ]
        },
        {state:"tutorial",label:"导航",title:"本次导航结束了",seconds:-2}
      ],afterPlayState:'tutorial'
      });
    }
});
