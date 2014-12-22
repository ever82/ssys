$$.View.StarRater=$$.View.Input.createSubclass({
    style:"form-group input-group",
    template:'${title} <input type="number">',
    defaultOptions:{
      clearButton:'<i class="fa fa-minus-square"></i>',
      clearCaption:'未评分'
    },
    beforeInit:function(options){
      options=options||{};
      this.options=$$.merge(options,this.defaultOptions);
      this.title=this.options.title||'';
      /*if(this.options.fa===undefined){
        this.options.fa=false;
      }*/
    },
    setInputData:function(value){
      this.input.rating('update',value);
    },
    afterInit:function(){
      this.input=this.find('input').rating(this.options);
      var content=this.find('.rating-container').data('content');
      content=content.replace(//g,"");
      this.find('.rating-container').attr('data-content',content);
    } 
});
$$.getCss('$$view/StarRater.css');
/*!
 * @copyright &copy; Kartik Visweswaran, Krajee.com, 2014
 * @version 3.3.0
 *
 * A simple yet powerful JQuery star rating plugin that allows rendering
 * fractional star ratings and supports Right to Left (RTL) input.
 * 
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */!function(e){var t=0,a=5,n=.5,r="ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,l=function(t,a){return"undefined"==typeof t||null===t||void 0===t||t==[]||""===t||a&&""===e.trim(t)},i=function(e,t,a){var n=l(e.data(t))?e.attr(t):e.data(t);return n?n:a[t]},s=function(e){var t=(""+e).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);return t?Math.max(0,(t[1]?t[1].length:0)-(t[2]?+t[2]:0)):0},o=function(e,t){return parseFloat(e.toFixed(t))},c=function(t,a){this.$element=e(t),this.init(a)};c.prototype={constructor:c,_parseAttr:function(e,r){var s=this,o=s.$element;if("range"===o.attr("type")||"number"===o.attr("type")){var c=i(o,e,r),u=n;"min"===e?u=t:"max"===e?u=a:"step"===e&&(u=n);var p=l(c)?u:c;return parseFloat(p)}return parseFloat(r[e])},listen:function(){var t=this;t.initTouch(),t.$rating.on("click",function(e){if(!t.inactive){var a=e.pageX-t.$rating.offset().left;t.setStars(a),t.$element.trigger("change"),t.$element.trigger("rating.change",[t.$element.val(),t.$caption.html()]),t.starClicked=!0}}),t.$rating.on("mousemove",function(e){if(t.hoverEnabled&&!t.inactive){t.starClicked=!1;var a=e.pageX-t.$rating.offset().left,n=t.calculate(a);t.toggleHover(n),t.$element.trigger("rating.hover",[n.val,n.caption,"stars"])}}),t.$rating.on("mouseleave",function(){if(t.hoverEnabled&&!t.inactive&&!t.starClicked){var e=t.cache;t.toggleHover(e),t.$element.trigger("rating.hoverleave",["stars"])}}),t.$clear.on("mousemove",function(){if(t.hoverEnabled&&!t.inactive&&t.hoverOnClear){t.clearClicked=!1;var e,a='<span class="'+t.clearCaptionClass+'">'+t.clearCaption+"</span>",n=t.clearValue,r=t.getWidthFromValue(n);e={caption:a,width:r,val:n},t.toggleHover(e),t.$element.trigger("rating.hover",[n,a,"clear"])}}),t.$clear.on("mouseleave",function(){if(t.hoverEnabled&&!t.inactive&&!t.clearClicked&&t.hoverOnClear){var e=t.cache;t.toggleHover(e),t.$element.trigger("rating.hoverleave",["clear"])}}),t.$clear.on("click",function(){t.inactive||(t.clear(),t.clearClicked=!0)}),e(t.$element[0].form).on("reset",function(){t.inactive||t.reset()})},setTouch:function(e,t){var a=this;if(r&&!a.inactive){var n=e.originalEvent,l=n.touches.length>0?n.touches:n.changedTouches,i=l[0].pageX-a.$rating.offset().left;if(t===!0)a.setStars(i),a.$element.trigger("change"),a.$element.trigger("rating.change",[a.$element.val(),a.$caption.html()]),a.starClicked=!0;else{var s=a.calculate(i),o=s.val<=a.clearValue?a.fetchCaption(a.clearValue):s.caption,c=a.getWidthFromValue(a.clearValue),u=s.val<=a.clearValue?a.rtl?100-c+"%":c+"%":s.width;a.$caption.html(o),a.$stars.css("width",u)}}},initTouch:function(){var e=this;e.$rating.on("touchstart",function(t){e.setTouch(t,!1)}),e.$rating.on("touchmove",function(t){e.setTouch(t,!1)}),e.$rating.on("touchend",function(t){e.setTouch(t,!0)})},initSlider:function(e){var r=this;l(r.$element.val())&&r.$element.val(0),r.initialValue=r.$element.val(),r.min="undefined"!=typeof e.min?e.min:r._parseAttr("min",e),r.max="undefined"!=typeof e.max?e.max:r._parseAttr("max",e),r.step="undefined"!=typeof e.step?e.step:r._parseAttr("step",e),(isNaN(r.min)||l(r.min))&&(r.min=t),(isNaN(r.max)||l(r.max))&&(r.max=a),(isNaN(r.step)||l(r.step)||0==r.step)&&(r.step=n),r.diff=r.max-r.min},init:function(t){var a=this;a.options=t,a.hoverEnabled=t.hoverEnabled,a.hoverChangeCaption=t.hoverChangeCaption,a.hoverChangeStars=t.hoverChangeStars,a.hoverOnClear=t.hoverOnClear,a.starClicked=!1,a.clearClicked=!1,a.initSlider(t),a.checkDisabled(),$element=a.$element,a.containerClass=t.containerClass,a.fa=t.fa;var n=a.fa?"":"★";a.symbol=l(t.symbol)?n:t.symbol,a.rtl=t.rtl||a.$element.attr("dir"),a.rtl&&a.$element.attr("dir","rtl"),a.showClear=t.showClear,a.showCaption=t.showCaption,a.size=t.size,a.stars=t.stars,a.defaultCaption=t.defaultCaption,a.starCaptions=t.starCaptions,a.starCaptionClasses=t.starCaptionClasses,a.clearButton=t.clearButton,a.clearButtonTitle=t.clearButtonTitle,a.clearButtonBaseClass=l(t.clearButtonBaseClass)?"clear-rating":t.clearButtonBaseClass,a.clearButtonActiveClass=l(t.clearButtonActiveClass)?"clear-rating-active":t.clearButtonActiveClass,a.clearCaption=t.clearCaption,a.clearCaptionClass=t.clearCaptionClass,a.clearValue=l(t.clearValue)?a.min:t.clearValue,a.$element.removeClass("form-control").addClass("form-control"),a.$clearElement=l(t.clearElement)?null:e(t.clearElement),a.$captionElement=l(t.captionElement)?null:e(t.captionElement),"undefined"==typeof a.$rating&&"undefined"==typeof a.$container&&(a.$rating=e(document.createElement("div")).html('<div class="rating-stars"></div>'),a.$container=e(document.createElement("div")),a.$container.before(a.$rating),a.$container.append(a.$rating),a.$element.before(a.$container).appendTo(a.$rating)),a.$stars=a.$rating.find(".rating-stars"),a.generateRating(),a.$clear=l(a.$clearElement)?a.$container.find("."+a.clearButtonBaseClass):a.$clearElement,a.$caption=l(a.$captionElement)?a.$container.find(".caption"):a.$captionElement,a.setStars(),a.$element.hide(),a.listen(),a.showClear&&a.$clear.attr({"class":a.getClearClass()}),a.cache={caption:a.$caption.html(),width:a.$stars.width(),val:a.$element.val()},a.$element.removeClass("rating-loading")},checkDisabled:function(){var e=this;e.disabled=i(e.$element,"disabled",e.options),e.readonly=i(e.$element,"readonly",e.options),e.inactive=e.disabled||e.readonly},getClearClass:function(){return this.clearButtonBaseClass+" "+(this.inactive?"":this.clearButtonActiveClass)},generateRating:function(){var e=this,t=e.renderClear(),a=e.renderCaption(),n=e.rtl?"rating-container-rtl":"rating-container",r=e.getStars();n+=e.fa?""==e.symbol?" rating-gly-star":" rating-gly":" rating-uni",e.$rating.attr("class",n),e.$rating.attr("data-content",r),e.$stars.attr("data-content",r);var n=e.rtl?"star-rating-rtl":"star-rating";e.$container.attr("class",n+" rating-"+e.size),e.inactive?e.$container.removeClass("rating-active").addClass("rating-disabled"):e.$container.removeClass("rating-disabled").addClass("rating-active"),"undefined"==typeof e.$caption&&"undefined"==typeof e.$clear&&(e.rtl?e.$container.prepend(a).append(t):e.$container.prepend(t).append(a)),l(e.containerClass)||e.$container.removeClass(e.containerClass).addClass(e.containerClass)},getStars:function(){for(var e=this,t=e.stars,a="",n=1;t>=n;n++)a+=e.symbol;return a},renderClear:function(){var e=this;if(!e.showClear)return"";var t=e.getClearClass();return l(e.$clearElement)?'<div class="'+t+'" title="'+e.clearButtonTitle+'">'+e.clearButton+"</div>":(e.$clearElement.removeClass(t).addClass(t).attr({title:e.clearButtonTitle}),e.$clearElement.html(e.clearButton),"")},renderCaption:function(){var e=this,t=e.$element.val();if(!e.showCaption)return"";var a=e.fetchCaption(t);return l(e.$captionElement)?'<div class="caption">'+a+"</div>":(e.$captionElement.removeClass("caption").addClass("caption").attr({title:e.clearCaption}),e.$captionElement.html(a),"")},fetchCaption:function(e){var t,a,n=this,r=parseFloat(e);if(t="function"==typeof n.starCaptionClasses?l(n.starCaptionClasses(r))?n.clearCaptionClass:n.starCaptionClasses(r):l(n.starCaptionClasses[r])?n.clearCaptionClass:n.starCaptionClasses[r],"function"==typeof n.starCaptions)var a=l(n.starCaptions(r))?n.defaultCaption.replace(/\{rating\}/g,r):n.starCaptions(r);else var a=l(n.starCaptions[r])?n.defaultCaption.replace(/\{rating\}/g,r):n.starCaptions[r];var i=r==n.clearValue?n.clearCaption:a;return'<span class="'+t+'">'+i+"</span>"},getWidthFromValue:function(e){{var t=this,a=t.min,n=t.max;t.step}return a>=e||a==n?0:e>=n?100:100*(e-a)/(n-a)},getValueFromPosition:function(e){var t,a,n=this,r=s(n.step),l=n.$rating.width();return a=n.diff*e/(l*n.step),a=n.rtl?Math.floor(a):Math.ceil(a),t=o(parseFloat(n.min+a*n.step),r),t=Math.max(Math.min(t,n.max),n.min),n.rtl?n.max-t:t},toggleHover:function(e){var t=this;if(t.hoverChangeCaption){var a=e.val<=t.clearValue?t.fetchCaption(t.clearValue):e.caption;t.$caption.html(a)}if(t.hoverChangeStars){var n=t.getWidthFromValue(t.clearValue),r=e.val<=t.clearValue?t.rtl?100-n+"%":n+"%":e.width;t.$stars.css("width",r)}},calculate:function(e){var t=this,a=l(t.$element.val())?0:t.$element.val(),n=arguments.length?t.getValueFromPosition(e):a,r=t.fetchCaption(n),i=t.getWidthFromValue(n);return t.rtl&&(i=100-i),i+="%",{caption:r,width:i,val:n}},setStars:function(e){var t=this,a=arguments.length?t.calculate(e):t.calculate();t.$element.val(a.val),t.$stars.css("width",a.width),t.$caption.html(a.caption),t.cache=a},clear:function(){var e=this,t='<span class="'+e.clearCaptionClass+'">'+e.clearCaption+"</span>";e.$stars.removeClass("rated"),e.inactive||e.$caption.html(t),e.$element.val(e.clearValue),e.setStars(),e.$element.trigger("rating.clear")},reset:function(){var e=this;e.$element.val(e.initialValue),e.setStars(),e.$element.trigger("rating.reset")},update:function(e){var t=this;arguments.length&&(t.$element.val(e),t.setStars())},refresh:function(t){var a=this;arguments.length&&(a.$rating.off(),a.$clear.off(),a.init(e.extend(a.options,t)),a.showClear?a.$clear.show():a.$clear.hide(),a.showCaption?a.$caption.show():a.$caption.hide(),a.$element.trigger("rating.refresh"))}},e.fn.rating=function(t){var a=Array.apply(null,arguments);return a.shift(),this.each(function(){var n=e(this),r=n.data("rating"),l="object"==typeof t&&t;r||n.data("rating",r=new c(this,e.extend({},e.fn.rating.defaults,l,e(this).data()))),"string"==typeof t&&r[t].apply(r,a)})},e.fn.rating.defaults={stars:5,fa:!0,symbol:null,disabled:!1,readonly:!1,rtl:!1,size:"md",showClear:!0,showCaption:!0,defaultCaption:"{rating} Stars",starCaptions:{.5:"Half Star",1:"One Star",1.5:"One & Half Star",2:"Two Stars",2.5:"Two & Half Stars",3:"Three Stars",3.5:"Three & Half Stars",4:"Four Stars",4.5:"Four & Half Stars",5:"Five Stars"},starCaptionClasses:{.5:"label label-danger",1:"label label-danger",1.5:"label label-warning",2:"label label-warning",2.5:"label label-info",3:"label label-info",3.5:"label label-primary",4:"label label-primary",4.5:"label label-success",5:"label label-success"},clearButton:'<i class="fa fa-minus-sign"></i>',clearButtonTitle:"Clear",clearButtonBaseClass:"clear-rating",clearButtonActiveClass:"clear-rating-active",clearCaption:"Not Rated",clearCaptionClass:"label label-default",clearValue:null,captionElement:null,clearElement:null,containerClass:null,hoverEnabled:!0,hoverChangeCaption:!0,hoverChangeStars:!0,hoverOnClear:!0},e("input.rating").addClass("rating-loading"),e(document).ready(function(){var t=e("input.rating"),a=Object.keys(t).length;a>0&&t.rating()})}(jQuery);
