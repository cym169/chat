var me = 0,other = 1;

var index = {
    socket : null,
    init : function () {
        this.setArea();
        this.setSocket();
        this.send();
        this.login();
        this.setIcon();
    },
    setArea : function () {
        $("#text").autoTextarea({
            maxHeight:300,
            massagebox:".message-box",
            operationbox: ".operation-box"
        });

        $("#text").on("keyup", function(e) {
            var val = $(this).val();
            if(val.length){
                $("#choose").hide();
                $("#send").show();
            }else{
                $("#choose").show();
                $("#send").hide();
            }

            if(e.keyCode == 13){
                $("#send").trigger("click");
            }
        });
    },
    setSocket : function () {
        var that = this;
        this.socket = io.connect();
        this.getMsg();
        this.existed();
        this.success();
        this.system();
    },
    // 点击发送消息
    send : function () {
        var that = this;
        $(document).on("click","#send",function(){
            var message = $("#text"),
                msg = message.val();
            message.val("").focus();
            $(this).hide();
            $("#choose").show();
            if ($.trim(msg).length != 0) {
                that.socket.emit('postMsg', msg);
                that.showMsg(0,'我',msg,'../content/icon.png');
                return;
            }
        })
    },
    getMsg : function () {
        var that = this;
        this.socket.on('newMsg', function(username, msg) {
            that.showMsg(1,username,msg,'../content/icon.png');
        });
    },
    existed : function () {
        this.socket.on('existed', function() {
            $(".tips").html("您输入的名字已存在！")
        });
    },
    success : function () {
        this.socket.on('success', function() {
            $(".login-wrapper").hide();
            $(".tips").html("欢迎来到陈明的聊天室！");
            $("#username").val("");
            $("#text").focus();
        });
    },
    system : function () {
        var that = this;
        this.socket.on('system', function(username, length, type) {
            that.showMsg(1,'系统提示',type == 0?username+'进入聊天室':username+'退出聊天室','../content/icon.png');
            $("#length").html(length);
        });
    },
    login : function () {
        var that = this;
        $(document).on("click","#login",function(){
            var message = $("#username"),
                name = message.val();
            if ($.trim(name).length != 0) {
                that.socket.emit('login', $.trim(name));
                return;
            }
        });

        $(document).on("keydown","#username",function(e){
            if(e.keyCode === 13){
                $("#login").trigger("click");
            }
        });
    },
    setIcon : function () {
        $(document).on("click","#icon",function(){
            var box = $(".emoji-box");
            if(box.hasClass('hidden')){
                if(box.find("li").length > 0){
                    box.removeClass('hidden');
                }else{
                    $.ajax({
                        url         : "/api/iconLength",
                        type        : "get",
                        dataType    : "json",
                        success     : function (res) {
                            if(res.code === 200){
                                $.each(res.data.list,function (i,t) {
                                    var str = $("<li title='"+t.title+"'><img src='"+t.imgUrl+"'></li>")
                                    box.append(str);
                                });
                                var h = box.height();
                                box.css("top",-h).removeClass('hidden');
                            }
                        }
                    })
                }
            }else{
                box.addClass('hidden');
            }
        });

        // 选择标签
        $(document).on("click",".emoji-box li",function(){
            var img = $(this).find("img");

        })
    },
    showMsg : function(type,name,msg,img){
        var str = "";
        var date = new Date().toTimeString().substr(0, 8);
        // 我自己，显示在右边
        if(type === 0){
            str = $('<div class="message-title">'+date+'</div>\n' +
                '            <div class="message message-sent">\n' +
                '                <div class="message-avatar"><img src="'+img+'" /></div>\n' +
                '                <div class="message-content">\n' +
                '                    <div class="message-bubble">\n' +
                '                        <div class="message-text">'+msg+'</div>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '            </div>');
        }
        // 其他人显示在左边
        else if(type === 1){
            str = $('<div class="message-title">'+date+'</div>\n' +
                '            <div class="message message-recevied">\n' +
                '                <div class="message-avatar"><img src="'+img+'" /></div>\n' +
                '                <div class="message-content">\n' +
                '                    <div class="message-name">'+name+'</div>\n' +
                '                    <div class="message-bubble">\n' +
                '                        <div class="message-text">'+msg+'</div>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '            </div>');
        }
        $(".messages").append(str);
        var h = $(".messages")[0].scrollHeight;
        $(".message-box").scrollTop(h);
    },
};



$(function(){
    index.init();
})


;(function($){
  $.fn.autoTextarea = function(options) {
    var defaults={
      maxHeight:null,
      massagebox:"",
      operationbox:"",
      minHeight:$(this).height()
    };
    var opts = $.extend({},defaults,options);
    return $(this).each(function() {
      $(this).bind("paste cut keydown keyup focus blur",function(){
        var height,style=this.style;
        this.style.height = opts.minHeight + 'px';
        if (this.scrollHeight > opts.minHeight) {
          if (opts.maxHeight && this.scrollHeight > opts.maxHeight) {
            height = opts.maxHeight;
            style.overflowY = 'scroll';
          } else {
            height = this.scrollHeight-12;
            style.overflowY = 'hidden';
          }
          style.height = height + 'px';
          $(opts.operationbox).css('height',height+20);
		  $(opts.massagebox).css('bottom',height+20);
          var h = $(".messages")[0].scrollHeight;
          $(opts.massagebox).scrollTop(h);
        }
      });
    });
  };
})(jQuery);