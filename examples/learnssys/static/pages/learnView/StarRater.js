learnssys.addPage("learnView_p_StarRater",{
    mg_elementConfigs:{
      defaultExample:['StarRater'],
      customizedExample:['StarRater',{
        clearButton:'<i class="fa fa-minus-square"></i>',
        clearCaption:'未评分',
        starCaptions:{
          0.5: '坚决反对',
          1: '反对',
          1.5: '不满意',
          2: '不太满意',
          2.5: '无所谓',
          3: '还可以',
          3.5: '满意',
          4: '很满意',
          4.5: '想不到更好的了',
          5: '最满意'
        }
      }]
    },
    initShow:['defaultExample','customizedExample'],
    initLoads:{
      StarRater:'js:$$view/StarRater.js'
    }
});
