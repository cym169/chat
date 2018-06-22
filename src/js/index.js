var me = 0,other = 1;

var index = {
    socket : null,
    init : function () {
        this.setArea();
        this.send();
        this.login();
        this.logout();
    },
    setSocket : function () {
        this.setUser();
        this.heartbeat();
        this.setIcon();
        this.getEmoji();
        this.getMsg();
        this.noLogin();
        this.existed();
        this.success();
        this.system();
        this.passError();
    },
    setUser: function () {
        var that = this;
        if(localStorage.name&&localStorage.pass){
            var name = localStorage.name;
            var pass = localStorage.pass;
            that.socket.emit('login', name, pass);
        }
    },
    setArea : function () {
        $("#text").autoTextarea({
            maxHeight:300,
            massagebox:".message-box",
            operationbox: ".operation-box"
        });

        $("#text").on("input propertychange blur focus", function() {
            var val = $(this).val();
            if(val.length){
                $("#choose").hide();
                $("#send").show();
            }else{
                $("#choose").show();
                $("#send").hide();
            }
        });
        $("#text").on("keyup",function (e) {
            if(e.keyCode == 13){
                e.stopPropagation();
                e.preventDefault();
                $("#send").trigger("click");
                return false;
            }
        });
    },
    heartbeat: function () {
        this.socket.on('heartbeat',function (flag) {
            if(flag == 'yes'){
                this.socket.emit('mybeat',true);
            }else{
                this.socket.emit('mybeat',false);
            }
        })
    },
    // 点击发送消息
    send : function () {
        var that = this;
        $(document).on("click","#send",function(){
            var message = $("#text"),
                msg = message.val(),
                userId = $("#userId").val();
            message.val("").focus();
            $(this).hide();
            $("#choose").show();
            if ($.trim(msg).length != 0) {
                that.socket.emit('postMsg', msg, userId);
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
    noLogin : function () {
        this.socket.on('noLogin', function() {
            $(".login-wrapper").hide();
            $(".tips").html("您未登录，请登录后继续聊天！");
            $("#username").val("");
            $("#text").focus();
        })
    },
    existed : function () {
        this.socket.on('existed', function() {
            $(".tips").html("该用户已经进入聊天室啦！");
        });
    },
    passError : function () {
        this.socket.on('passerror', function() {
            $(".tips").html("您输入的密码错误！");
        });
    },
    getEmoji : function () {
        this.socket.on("getEmoji",function (data) {
            var box = $(".emoji-box");
            $.each(data,function (i,t) {
                var str = $("<li title='emoji"+t.name+"'><img src='"+t.imgUrl+"'></li>");
                box.append(str);
            });
            var h = box.height();
            box.css("top",-h);
        });
    },
    success : function () {
        this.socket.on('success', function(id) {
            $(".login-wrapper").hide();
            $(".tips").html("欢迎来到陈明的聊天室！");
            $("#username").val("");
            $("#password").val("");
            $("#text").focus();
            $("#userId").val(id);
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
                password = $("#password"),
                name = message.val(),
                pass = password.val();
            if (name.length != 0 && pass.length != 0) {
                that.socket = io.connect();
                that.setSocket();
                that.socket.emit('login', name, md5(pass));
                localStorage.name = name;
                localStorage.pass = md5(pass);
            }
        });

        $(document).on("keydown","#username,#password",function(e){
            if(e.keyCode === 13){
                $("#login").trigger("click");
            }
        });
    },
    logout : function () {
        var that = this;
        $(document).on("click","#logout",function(e){
            localStorage.removeItem('name');
            localStorage.removeItem('pass');
            that.socket.disconnect();
            that.socket = null;
            $(".login-wrapper").show();
            $("#userId").val("");
        })
    },
    setIcon : function () {
        var that = this;
        that.socket.emit("emoji");
        $(document).on("click","#icon",function(e){
            var box = $(".emoji-box");
            if(box.hasClass('hidden')){
                box.removeClass('hidden');
            }else{
                box.addClass('hidden');
            }
            e.stopPropagation();
        });

        $(document).on("click",function (e) {
            var emojibox = $(".emoji-box");
            if (e.target != emojibox) {
                emojibox.addClass('hidden');
            }
        });

        // 选择表情
        $(document).on("click",".emoji-box li",function(){
            var title = $(this).attr("title"),
                emoji = "["+title+"]",
                val = $("#text").val();
            $("#text").val(val+emoji);
            $("#text").focus();
            $(".emoji-box").addClass("hidden");
        })
    },
    showMsg : function(type,name,msg,img){
        var str = "",
            that = this,
            date = new Date().toTimeString().substr(0, 8),
            data = that.showEmoji(msg);
        // 我自己，显示在右边
        if(type === 0){
            str = $('<div class="message-title">'+date+'</div>\n' +
                '            <div class="message message-sent">\n' +
                '                <div class="message-avatar"><img src="'+img+'" /></div>\n' +
                '                <div class="message-content">\n' +
                '                    <div class="message-bubble">\n' +
                '                        <div class="message-text">'+data+'</div>\n' +
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
                '                        <div class="message-text">'+data+'</div>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '            </div>');
        }
        $(".messages").append(str);
        var h = $(".messages")[0].scrollHeight;
        var mh = $(".message-box").offset().top;
        $(".message-box").scrollTop(h);
    },
    showEmoji : function (msg) {
        var reg = /\[emoji\d+\]/g,
            name,
            emojiIndex,
            result = msg;
        while (name = reg.exec(msg)) {
            emojiIndex = name[0].slice(6, -1);
            result = result.replace(name[0], '<img class="emoji" src="http://172.16.2.78:2333/content/emoji/' + emojiIndex + '.gif" />');
        }
        return result;
    }
};



$(function(){
    $("#username").focus();
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