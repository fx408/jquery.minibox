;(function($) {
	$.fn.miniBoxId = "miniBox-2012"; // mini弹出框ID
	
	/**
	 * 显示
	 * @params {content:'……', showButton:true, width:250, callback:function(){}, noCallback:''}
	 */
	$.fn.showMiniBox = function(options) {
		return showMiniBox(this, options);
	}
	
	/**
	 * mini提示框
	 * @params {msg:'……', color:'red', autoClose:true}
	 */
	$.fn.pointMsg = function(options) {
		return pointMsg(this, options);
	}
	
	/**
	 * mini确认框
	 * @params {msg:'……', color:'red', callback:function(){}, noCallback:''}
	 */
	$.fn.miniConfirm = function(options) {
		return miniConfirm(this, options);
	}
	
	/**
	 * 公共的AJAX提交表单方法
	 * @params {url:'……', formId:'red', successCall:function(){}, errorCall:'', showSuccessMsg:true}
	 */
	$.fn.publicAjaxPost = function(options) {
		return publicAjaxPost(this, options);
	}
	
	function showMiniBox(obj, options) {
		var opts = $.extend({}, defaults, options);
		if(typeof opts.width != 'number' || opts.width <= 0) opts.width = 250;
		
		$(miniBoxId).children("span").html(opts.content);
		opts.showButton ? $(miniBoxId).find("input").show() : $(miniBoxId).find("input").hide();

		// 避免提示框 超出浏览器窗口范围
		var ofs = $(obj).offset();
		ofs.left = Math.min( $(window).width() - opts.width - 20 + $(window).scrollLeft(), ofs.left );
		ofs.top = Math.min( $(window).height() + $(window).scrollTop() - $(miniBoxId).height() - 20, ofs.top );
		$(miniBoxId).css({"top":ofs.top+"px", "left":ofs.left+"px", "width":opts.width+"px"}).fadeIn(180);
		
		if(opts.showButton) {
			boxButtonYesEvent = opts.callback;
			boxButtonNoEvent = opts.noCallback;
		}
	}
	
	/**
	 * 关闭
	 * @param time 延时毫秒，在time毫秒后关闭
	 */
	$.fn.closeMiniBox = function(time) {
		if(typeof time != 'number') time = 3000;
		clearTimeout(closeBoxTime);
		closeBoxTime = setTimeout(function() {
			$(miniBoxId).fadeOut(360);
		}, time);
	}
	
	// 注册CSS 样式
	$.fn.regCSSWithString = function(string) {
		if(!string) return;
		
		var styleNode = $('<style type="text/css">'+string+'</style>');
		if($(document).find("head").length) $(document).find("head").append(styleNode);
		else $(document).append(styleNode);
	}
	
	function pointMsg(obj, options) {
		var opts = $.extend({}, defaults, options);
		
		opts.content = '<div style="color:'+opts.color+'">'+opts.msg+'</div>',
		opts.callback = function() {
			$.fn.closeMiniBox(0);
		};
		opts.width = 120;
		if(opts.color != 'red' && opts.autoClose === true) $.fn.closeMiniBox(opts.autoCloseTime);
		
		showMiniBox(obj, opts);
	}
	
	function miniConfirm(obj, options) {
		var opts = $.extend({}, defaults, options);
		opts.content = '<div style="color:'+opts.color+'">'+opts.msg+'</div>',
		opts.width = 120;
		showMiniBox(obj, opts);
	}
	
	// 是否允许AJAX 请求，单线程，当前一个AJAX请求位完成时，不允许再次请求
	// 请求返还 JSON 格式数据，本方法中 设定 data.error == 0 表示成功， data.msg 为消息
	allowAjaxPost = true;
	function publicAjaxPost(obj, options) {
		if(allowAjaxPost === false) {
			pointMsg(obj, {msg:'等待AJAX请求队列！'});
			return;
		}
		
		var opts = $.extend({}, defaults, options);
		allowAjaxPost = false;
		
		pointMsg(obj, {msg:'等待请求...', color:'green', autoClose:false});
		
		var success = function(data) {
			if(data && data.error == 0) {
				if(typeof opts.successCall == 'function') {
					opts.successCall(data);
				}
				opts.showSuccessMsg===true && pointMsg(obj, {msg:data.msg, color:'green'});
			} else {
				pointMsg(obj, {msg:data.msg});
			}
			allowAjaxPost = true;
		}
		
		var error = function() {
			pointMsg(obj, {msg:'请求失败！'});
			if(typeof opts.errorCall == 'function') {
				opts.errorCall();
			}
			allowAjaxPost = true;
		}
		
		var postData = null;
		if(typeof opts.formId == 'string') opts.formId = "#"+opts.formId;
		if($(opts.formId).length) postData = $(opts.formId).serialize();
		
		$.ajax({
			url: opts.url,
			type: 'post',
			data: postData,
			dataType: 'json',
			success: success,
			error: error
		});
	}
	
	// 注册插件所需的样式
	function regPublicBoxCss() {
		var string = miniBoxId+' {'
				+'position: absolute; font-size:12px; font-family:"Microsoft Yahei",Arial,Helvetica,sans-serif,"宋体"; color:#333'
				+'width: 150px; padding: 7px 5px 5px; text-align: center; line-height: 19px;'
				+'border:0px; isplay:none;z-index: 20; background-color: #f8f8f8;'
				+'border-radius: 5px;-moz-border-radius: 5px;-webkit-border-radius: 5px;'
				+'box-shadow: 0px 0px 8px rgba(11,11,11, .7);'
				+'-moz-transition: -moz-box-shadow linear .2s;-webkit-transition: -webkit-box-shadow linear .2s;'
				+'transition: -webkit-box-shadow linear .2s;}'
				+miniBoxId+' .input_btn{cursor:pointer; height: 22px;padding: 1px 6px; color:#333; line-height:100%; float:none}';
		
		if($.browser.msie && $.browser.version < 9) string += miniBoxId+'{border:1px solid #999;}';
		
		$.fn.regCSSWithString(string);
	}
	
	// 默认参数
	var defaults = {
		width: 250,
		content: 'hello!', // 调用 showMiniBox 时的内容
		callback: function(){}, // “确定”按钮回调
		noCallback: '', // “取消”按钮回调
		showButton: true, // 是否显示按钮
		msg: '', // 用于 miniConfirm， 和 pointMsg
		color: 'red', // 消息颜色
		autoClose: true, // 是否自动延时关闭
		autoCloseTime: 2500, // 延时关闭时间
		
		// 用于 publicAjaxPost
		url: '', //不解释
		formId: '', //需要提交的表单ID
		successCall: function(){}, //请求成功时的回调函数
		errorCall: function(){}, //请求失败时的回调函数
		showSuccessMsg: true //是否显示请求成功的消息
	},
	miniBoxId = "#"+$.fn.miniBoxId,
	closeBoxTime = '', // setTimeout 结果保留
	boxButtonYesEvent = function() {}, // 用于响应"确认"按钮事件
	boxButtonNoEvent = function() {},  // 用于响应"取消"按钮事件
	
	boxHtml = '<div class="miniBox" id="'+$.fn.miniBoxId+'" style="width:250px; display:none">'+
	'<span></span>'+
	'<input value="确定" type="button" class="input_btn" name="yes">'+
	'<input value="取消" type="button" class="input_btn" name="no">'+
	'</div>';
	
	$.fn.tableColor = function(table, options) {
		var opts = $.extend({}, {odd:'odd', even:'even'}, options);
		table = typeof table == 'string' ? $("#"+table) : $(table);
		
		table.find("tbody tr:visible:even").removeClass().addClass(opts.odd)
		.end().find("tbody tr:visible:odd").removeClass().addClass(opts.even);
	}
	
	/**
	 * 插件 初始化
	 */
	$(function() {
	 	regPublicBoxCss();
		if(!$(miniBoxId).length) $("body").append(boxHtml);
		$(miniBoxId).appendTo("body");
		
		// 绑定 确认 和 取消按钮的 点击事件
		$(miniBoxId).find("input[name=yes]").unbind("click").live("click", function() {
			typeof boxButtonYesEvent === "function" ? boxButtonYesEvent() : $.fn.closeMiniBox(0);
		})
		.end().find("input[name=no]").unbind("click").live("click", function() {
			typeof boxButtonNoEvent === "function" ? boxButtonNoEvent() : $.fn.closeMiniBox(0);
		});
	});
})(jQuery);