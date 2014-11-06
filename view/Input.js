$$.View["Input"]=$$.View.createSubclass({
    defaultState:'start',
    style:'ssysInput form-group',
    setInputData:function(value){
      this.input.val(value);
    },
    updateInputData:function(){
      this.removeErrors();
      return this.inputData=this.input.val();
    },
    showError:function(error){
      this.addClass('has-error');
      this.append('<label class="control-label" for="inputError">'+error+'</label>');
    },
    removeErrors:function(){
      this.removeClass("ssysErrorElement has-error");
      this.find(".control-label").remove();
    }
});
$$.View.NumberInput=$$.View.Input.createSubclass({
    beforeInit:function(options){
      var defaultValue=options.defaultValue||'';
      var unit=options.unit||'';
      var title=options.title||'';
      var inputHtml="<input type='number' class='ssysNumberInput form-inline form-control' value='"+defaultValue+"' >"+unit;
      if(title.match(/{{}}/)){
        var html=title.replace('{{}}',inputHtml);
      }else{
        var html="<label>"+title+"</label>"+inputHtml;
      }
      this.html(html);
      this.input=this.find("input.form-control");
    },
    updateInputData:function(){
      this.removeErrors();
      return this.inputData=parseFloat(this.input.val());
    },
    setInputData:function(value){
      this.input.val(value);
    }    
});

$$.View.StringInput=$$.View.Input.createSubclass({
    beforeInit:function(title,note,defaultValue){
      this.defaultValue=defaultValue;
      $(this.domnode).html("<input class='form-control' placeholder='"+title+"' value='"+(defaultValue||'')+"' >"+(note?("<div class='help-block'>"+note+"</div>"):''));
      this.input=$(this.domnode).children("input").data("defaultValue",defaultValue);
      if(ssys.isIE&&defaultValue===undefined){
        this.input.placeholder();
      }
    }
    
});
$$.View.BooleanInput=$$.View.Input.createSubclass({
    beforeInit:function(title,note,defaultValue){
      this.html("<label>"+title+"  <input type='checkbox' checked='"+(defaultValue||'false')+"'></label>"+(note?("<div class='help-block'>"+note+"</div>"):''));
      this.input=this.find("input");
    },
    setInputData:function(value){
      this.input.prop('checked',value);
    },
    updateInputData:function(){
      this.removeErrors();
      return this.inputData=this.input.prop('checked');
    }
    
});
$$.View.TextInput=$$.View.Input.createSubclass({
    beforeInit:function(options){
      this.max=options.max;
      var defaultValue=options.defaultValue||'';
      this.html("<textarea class='form-control' placeholder='"+(options.title||'')+"' value='"+defaultValue+"'></textarea><h3><small>"+(options.note||'')+(this.max?("(<span class='textMax'>字数不能超过"+this.max+"</span>)"):'')+"</small></h3>");
      this.textarea=this.children('textarea');
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
          this.textarea.placeholder();
        }
        
      }
      
    },
    afterInit:function(){
      
    },
    setInputData:function(value){
      //console.debug("in setInputData","value=",value);
      if(!this.isRich){
        this.textarea.val(value.replace(/\n/g, '<br>'));
      }else{
        return this.find(".note-editable").html(value);
      }
    },
    updateInputData:function(){
      this.removeErrors();
      if(!this.isRich){
        return this.inputData=this.textarea.val();
      }else{
        return this.find(".note-editable").code();
      }
    }
    
});
$$.View.PasswordInput=$$.View.Input.createSubclass({
    beforeInit:function(title,note){
      title=title||'密码';
      this.html("<label>输入密码</label><input class='form-control' placeholder='"+title+"' type='password'><div class='help-block'>"+(note||'')+"</div>");
      this.input=this.children("input");
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
        //console.debug("密码不能为空");
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

