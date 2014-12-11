$$.View["Input"]=$$.View.createSubclass({
    defaultState:'start',
    errorConfigs:{
      empty:"这是必填项",
      notUnique:"已经有人使用了,请换一个",
      tooLong:function(max){
        return "字数不能超过"+max;
      },
      tooShort:function(min){
        return "字数不能少于"+min;
      },
      tooBig:function(max){
        return "不能大于"+max;
      },
      tooSmall:function(min){
        return "不能小于"+min;
      },
      notEmail:function(){
        return "请填写正确的邮箱地址";
      },
      notUrl:function(){
        return "请填写正确的网址";
      },
      notNumber:function(){
        return "请填写正确的数字";
      }
    },
    style:'ssysInput form-group',
    setInputData:function(value){
      this.input.val(value);
    },
    updateInputData:function(){
      this.removeErrors();
      return this.inputData=this.input.val();
    },
    showError:function(error){
      var options=this.options||this.params[0]||{};
      optionsErrors=options.errors||{};
      if(typeof error=="object"){
        var errorType=error.errorType;
        var errorContent=error.errorContent;
      }else{
        var errorType=error;
      }
      var errorConfig=optionsErrors[errorType]||this.errorConfigs[errorType]||null;
      if(typeof errorConfig=="function"){
        error=errorConfig.call(this,errorContent);
      }else if(typeof errorConfig=="string"){
        error=errorConfig;
      }
      this.addClass('has-error');
      this.append('<label class="control-label" for="inputError">'+error+'</label>');
    },
    removeErrors:function(){
      this.removeClass("ssysErrorElement has-error");
      this.find(".control-label").remove();
    },
    beforeInit:function(options){
      this.options=options||{};
    },
    afterInit:function(){
      this.input=this.find("input.form-control");
    }
});
$$.View.NumberInput=$$.View.Input.createSubclass({
    style:"form-group input-group",
    template:"<span class='input-group-addon'><span class='fa fa-${options.icon}'></span></span><input class='ssysNumberInput form-control' value='${options.defaultValue}' placeholder='${options.placeholder}'><span class='input-group-addon'>${options.unit}</span>",
    updateInputData:function(){
      this.removeErrors();
      return this.inputData=this.input.val();
    },
    setInputData:function(value){
      this.input.val(value);
    }    
});

$$.View.StringInput=$$.View.Input.createSubclass({
    style:'form-group',
    beforeInit:function(options){
      this.options=options;
      var defaultValue=options.defaultValue;
      var labelClass=options.labelClass||'col-xs-2';
      var inputClass=options.inputClass||(options.label?'col-xs-10':'input-group');
      var label=options.label?"<label class='col-xs-2'>"+options.label+"</label>":'';
      var placeholder=options.placeholder||'';
      var addon=options.icon?"<span class='input-group-addon'><span class='fa fa-"+options.icon+"'></span></span>":'';
      var help=options.help?"<div class='help-block'>"+options.help+"</div>":'';
      this.html(label+"<div class='"+inputClass+"'>"+addon+"<input class='form-control' placeholder='"+placeholder+"' value='"+(defaultValue||'')+"' >"+help+"</div>");
      this.input=$(this.domnode).find("input").data("defaultValue",defaultValue);
      if(ssys.isIE&&defaultValue===undefined){
        this.input.placeholder();
      }
    }
    
});
$$.View.BooleanInput=$$.View.Input.createSubclass({
    style:'checkbox',
    beforeInit:function(title,defaultValue){
      this.html("<label><input type='checkbox' checked='"+(defaultValue||'false')+"'> "+title+"</label>");
    },
    setInputData:function(value){
      this.find("input").prop('checked',value);
    },
    updateInputData:function(){
      this.removeErrors();
      return this.inputData=this.find("input").prop('checked');
    }
    
});
$$.View.TextInput=$$.View.Input.createSubclass({
    addCssClass:'textInput',
    beforeInit:function(options){
      this.max=options.max;
      var defaultValue=options.defaultValue||'';
      this.html("<textarea class='form-control' placeholder='"+(options.placeholder||'')+"' value='"+defaultValue+"'></textarea><div><small>"+(options.note||'')+(this.max?("<span class='textMax'>字数不能超过"+this.max+"</span>"):'')+"</small></div>");
      var _this=this;
      var richOptions=options.richOptions;
      if(richOptions){
        this.isRich=true;
        var url=ssys.sresBaseUrl+"lib/summernote/summernote.js";
        var cssUrl=ssys.sresBaseUrl+"lib/summernote/summernote.css";
        var uploadUrl=this.app.uploadBaseUrl+"images/";
        var _this=this;
        return ssys.getJs(url).pipe(function(){
            ssys.getCss(cssUrl);
            ssys.merge(richOptions,{
            width: 700,
            height: 300,   
            locale:'zh-CN',
            uploadImageUrl:(_this.app.baseUrl+'uploader/uploadImage.php'),
            uploadUrl:uploadUrl,
            toolbar: [
              //['style', ['style']], // no style button
              ['style', ['bold', 'italic', 'underline', 'clear']],
              ['fontsize', ['fontsize']],
              ['color', ['color']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['height', ['height']],
              ['insert', ['picture', 'link']], 
              ['view', ['codeview']]// no insert buttons
              //['table', ['table']], // no table button
              //['help', ['help']] //no help button
            ],
            currentUser:_this.app.currentUser
          });
          //tinymce.init(richOptions);         
          $("#"+_this.fullname+" textarea").summernote(richOptions);
        });
      }else{
        if(ssys.isIE&&defaultValue===undefined){
          $("#"+_this.fullname+" textarea").placeholder();
        }
        
      }
      
    },
    afterInit:function(){
      
    },
    setInputData:function(value){
      if(!this.isRich){
        this.find("textarea").val(value.replace(/\n/g, '<br>'));
      }else{
        return this.find(".note-editable").html(value);
      }
    },
    updateInputData:function(){
      this.removeErrors();
      if(!this.isRich){
        return this.inputData=this.find("textarea").val();
      }else{
        return this.find(".note-editable").code();
      }
    }
    
});
$$.View.PasswordInput=$$.View.Input.createSubclass({
    style:'form-group',
    beforeInit:function(options){
      options=options||{};
      var placeholder=options.placeholder||'输入密码';
      this.html("<div class='input-group'><span class='input-group-addon'><span class='fa fa-key'></span></span><input class='form-control' placeholder='"+placeholder+"' type='password'></div>");
      this.input=this.find("input");
    },
    updateInputData:function(){
      this.removeErrors();
      password=this.input.val();
      if(!password){
        this.showError('必须填写密码');
        throw new Error('密码不能为空');
      }
      return this.inputData=password;
    }
    
});
$$.View.RegisterPasswordInput=$$.View.Input.createSubclass({
    beforeInit:function(title,note){
      title=title||'密码';
      this.html("<label>输入密码: </label><div class='form-group'><input class='password form-control' placeholder='"+title+"' type='password'><div class='help-block'>"+(note||'')+"</div></div><label>确认密码: </label><div class='form-group'><input class='confirmPassword form-control' placeholder='确认密码' type='password'></div>");
    },
    updateInputData:function(){
      var password=this.find(".password").val();
      var confirmPassword=this.find(".confirmPassword").val();
      this.removeErrors();
      if(!password){
        this.showError('密码不能为空','password');
        throw new Error('密码不能为空');
      }
      if(!confirmPassword){
        this.showError('确认密码不能为空','confirmPassword');
        throw new Error('确认密码不能为空');
      }
      if(password!=confirmPassword){
        this.showError('密码不一致','confirmPassword');
        throw new Error('密码不一致');
      }
      return this.inputData=password;
    }
    
});

