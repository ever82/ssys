GroupSatisCurve=SsysObject.createSubclass({
    getMaxPoint:function(points){
      points=points||this.pointList;
      var length=points.length;
      var i=0;
      var maxY=points[i][1];
      var maxPointIndex=0;
      while(i<length-1){
        var y=points[i+1][1];
        i++;
        if(y>maxY){
          maxPointIndex=i;
          maxY=y;
        }
      }
      this.maxPoint=points[maxPointIndex];
      this.maxPointIndex=maxPointIndex;
      this.bestX=this.maxPoint[0];
      this.bestY=maxY;
      return this.maxPoint;
    },
    getScore:function(totalCurve){
      var totalPoints=totalCurve.pointList;
      var totalMaxY=totalCurve.bestY;
      var sampleMaxY =sampleCurve.bestY;
      var totalYAtSampleMaxPointIndex = totalPoints[sampleCurve.maxPointIndex][1];
      var score = (((totalYAtSampleMaxPointIndex+10)/(totalMaxY+10))*100).toFixed(2);
      return score;
    },
    getY:function(x,personCurves){
      var y=0;
      for(var i=0,l=personCurves.length;i<l;i++){
        var curve=personCurves[i];
        y=y+curve.getY(x);
      }
      return y/l;
    }
 },{
  create:function(points){
    var o=new this;
    o.points=points;
    o.pointList=[];
    for(var x in points){
      o.pointList.push([parseInt(x),points[x]]);
    }
    o.pointList.sort(function(a,b){
        return a[0]-b[0];
    });
    o.getMaxPoint();
    //console.debug("","o.bestY=",o.bestY);
    return o;
  },
  createByPointList:function(pointList){
    var o=new this;
    o.pointList=pointList;
    o.getMaxPoint();
    return o;
  }
},'GroupSatisCurve');
PersonSatisCurve=SsysObject.createSubclass({
  minY:-10,
  maxY:10,
  precision:100,
  inflectionPointY:2,
  get3PointsExpectation:function(bestX,leftPoint,rightPoint){
    var meanPoint=[bestX,this.maxY];
    var leftHalf=this.getFunctionParam(meanPoint,leftPoint);
    var rightHalf=this.getFunctionParam(meanPoint,rightPoint);
    if(leftHalf===null){
      leftHalf=rightHalf;
    }else if(rightHalf===null){
      rightHalf=leftHalf;
    }
    return [bestX,leftHalf,rightHalf];
  },
  getFunctionParam:function(meanPoint,point){
    if(!point){
      return null;
    }
    var x=point[0];
    var y=point[1];
    var bestX=meanPoint[0];
    var meanY=meanPoint[1];
    var minY=this.minY;
    var maxY=this.maxY;
    if(y==minY){
      y=minY*0.9;
    }else if(y==maxY){
      y=maxY*0.99;
    }
    if(y==meanY||x==bestX){
      //这时给出的约束只有一点,无法确定曲线,
      //即这时求不出b值来
      return null;
    }
    var temp=Math.log((meanY-minY)/(y-minY));
    return Math.pow((x-bestX),2)/temp;
  },
  getY:function(x){
    var b=this.bestX,c1=this.leftHalf,c2=this.rightHalf;
    var a=this.maxY-this.minY;
    var d=this.minY;
    if(x<b){
      var y=a*Math.exp(-Math.pow((x-b),2)/c1)+d;
    }else{
      var y=a*Math.exp(-Math.pow((x-b),2)/c2)+d;
    }
    return y;
  },
  getX:function(y){
    var b=this.bestX;
    var c1=this.leftHalf;
    var c2=this.rightHalf;
    var minY=this.minY;
    var maxY=this.maxY;
    var a=maxY-minY;
    if(c1!==null){
      var k1=Math.sqrt(c1*Math.log(a/(y-minY)));
      //x1表示曲线左边的点的横坐标,所以它必须小于等于b
      var x1=b-k1;
    }else{
      var x1=null;
    }
    if(c2!==null){
      var k2=Math.sqrt(c2*Math.log(a/(y-minY)));
      //x2表示曲线左边的点的横坐标,所以它必须大于等于b
      var x2=k2+b;
    }else{
      var x2=null;
    }
    return [x1,x2];
  },
  getPointList:function(relativePointList){
    var pointList=[];
    if(relativePointList){
      for(var i=0,l=relativePointList.length;i<l;i++){
        var point=relativePointList[i];
        var x=point[0];
        var y=this.getY(x);
        pointList.push([x,y]);
      }
    }else{
      var xs=this.getX(this.minY*0.9);
      var x0=xs[0]===null?this.bestX:xs[0];
      var x1=xs[1]===null?this.bestX:xs[1];
      var x=x0;
      var unit=(x1-x0)/this.precision;
      while(x<x1){
        //console.debug("","x=",x);
        var y=this.getY(x);
        //console.debug("","y=",y);
        pointList.push([x,y]);
        x=x+unit;
      }
    }
    return pointList;
  }
},{
  create:function(bestX,leftHalf,rightHalf,weight,maxY){
    var o=new this;
    o.bestX=bestX;
    o.leftHalf=leftHalf;
    o.rightHalf=rightHalf;
    o.weight=weight||1;
    if(maxY!==undefined){
      o.maxY=maxY;
    }
    o.bestY=o.maxY;
    o.pointList=o.getPointList();
    return o;
  },
  createBy3Points:function(bestX,leftPoint,rightPoint,weight,maxY){
    var model=new this;
    if(maxY!==undefined){
      model.maxY=maxY;
    }
    var exp=model.get3PointsExpectation(bestX,leftPoint,rightPoint);
    var leftHalf=exp[1];
    var rightHalf=exp[2];
    return this.create(bestX,leftHalf,rightHalf,weight,maxY);
  },
  createByInflectionPoints:function(bestX,minX,maxX,weight,maxY){
    var model=new this;
    if(maxY!==undefined){
      model.maxY=maxY;
    }
    var leftPoint=[minX,model.inflectionPointY];
    var rightPoint=[maxX,model.inflectionPointY];
    var exp=model.get3PointsExpectation(bestX,leftPoint,rightPoint);
    var leftHalf=exp[1];
    var rightHalf=exp[2];
    return this.create(bestX,leftHalf,rightHalf,weight,maxY);
  }
},"PersonSatisCurve");
SsysModel.createSubclass({
  validateBestX:function(data,params,result){
    if(typeof this.minX=="number"){
      var minX=this.minX;
      if(data<=minX){
        result.error="它必须大于你输入的最小值:"+minX;
        return ssys.reject(result);
      }
    }
    if(typeof this.maxX=="number"){
      var maxX=this.maxX;
      if(data>=maxX){
        result.error="它必须小于你输入的最大值:"+maxX;
        return ssys.reject(result);
      }
    }
    result.data=data;
    return ssys.resolve(result);
  },
  validateMinX:function(data,params,result){
    var bestX=params.bestX===undefined?this.bestX:params.bestX;
    if(data<bestX){
      result.data=data;
      return ssys.resolve(result);
    }else{
      if(bestX>=0){
        result.error="它必须小于你输入的最满意值:"+bestX;
      }else{
        result.error="它必须大于你输入的最满意值:"+(-bestX);
      }
      return ssys.reject(result);
    }
  },
  validateMaxX:function(data,params,result){
    var bestX=params.bestX===undefined?this.bestX:params.bestX;
    if(data>bestX){
      result.data=data;
      return ssys.resolve(result);
    }else{
      if(bestX>=0){
        result.error="它必须大于你输入的最满意值:"+bestX;
      }else{
        result.error="它必须小于你输入的最满意值:"+(-bestX);
      }
      return ssys.reject(result);
    }
  },
  validateY:function(data,params,result){
    if(data>=10){
      result.error="它必须小于10";
      return ssys.reject(result);
    }else if(data<=-10){
      result.error="它必须大于-10";
      return ssys.reject(result);
    }else{
      result.data=data;
      return ssys.resolve(result);
    }
  },
  isPersonal:function(){
    return this.typename.match(/^Person/);
  },
  getCurve:function(){
    if(!this.curve){
      if(this.isPersonal()){
        this.curve=this.getPersonCurve();
      }else{
        this.curve=this.getGroupCurve();
      }
    }
    return this.curve;
  },
  _clearCache:function(){
    this.parentCall('_clearCache');
    this.curve=null;
  },
  /**
   * 根据赋值情况生成个人曲线函数, 可以被override, 
   * 这里给出最常用的一种, 即拐点赋值的情况
   */
  getPersonCurve:function(){
    return PersonSatisCurve.createByInflectionPoints(this.bestX,this.minX,this.maxX,this.weight||1);
  },
  
  getGroupCurve:function(){
    return GroupSatisCurve.create(this.points,this.bestX);
  }
  
},{

},"Valuation");