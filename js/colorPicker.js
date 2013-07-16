(function($) {
	// 定义变换序列
	var colors = {"r":['ff'], "b":['ff'], "g":['ff']};
	colors.c = ['g', 'b', 'g', 'r', 'b', 'g', 'r'];
	colors.n = [255, 255, 0, 255, 0, 255, 0];

	// 颜色压缩
	var ratio = 6, len = 256 / ratio;

	// 定义基础颜色
	var r=255, g=255, b=255, rgb = {"r":"", "g":"", "b":""};

	$.fn.colorPicker = function(options) {
		var _this = this, opts = $.extend({}, $.fn.colorPicker.defaults, options);
		opts.pickerHalfHeight = Math.round(opts.pickerHeight / 2);
		ratio = opts.ratio;
		len = 256 / ratio;

		return this.each(function() {
			var o = $.meta ? $.extend({}, opts, $(_this).data()) : opts;
			var pickerWidth = Math.ceil(colors.c.length*len); // 去白时 需要额外减去 len/2
			
			$(_this).html('<canvas id="canvasColorPicker" width="'+pickerWidth+'" height="'+o.pickerHeight+'"></canvas>');
			var create = createCanvasPicker(o.pickerHeight, o.pickerHalfHeight);
			if(create === true) {
				$("#canvasColorPicker").unbind("click").bind("click", function(e) {
					// 当前点 的相对坐标
					try{
						var positionX = ( e.originalEvent.x - $(this).offset().left) || e.originalEvent.layerX || 0;
						var positionY = ( e.originalEvent.y - $(this).offset().top ) || e.originalEvent.layerY || 0;
						
						var color = getPointRGB(positionX, Math.abs(positionY), o.pickerHalfHeight);
						o.callFun(color);
					} catch(e) {}
				});
			} else {
				createSimplePicker(_this);
				// 切换字体颜色
				$("#font_color div[name]").unbind("click").bind("click", function() {
					o.callFun($(this).attr("name"));
				});
			}
		});
	};

	$.fn.colorPicker.defaults = {
		ratio:6,
		pickerHeight: 80,
		pickerHalfHeight: 0,
		callFun: function(color) {}
	};
	
	// 创建HTML5 Canvas 颜色选择器
	function createCanvasPicker(h, halfH) {
		var canvas = document.getElementById('canvasColorPicker');
		try {
			if(!canvas.getContext) return false;
		} catch(e) {
			return false;
		};

		var ctx = canvas.getContext('2d');
		var n = 0, color = '';

		for(var k in colors.c) {
			// 记录RBG 颜色变化流程
			for(var rgbk in rgb) {
				colors[rgbk][k*1+1] = rgbk == colors.c[k] ? dechex(255 - colors.n[k]) : colors[rgbk][k];
			}

			// 绘制渐变线条
			for(var i = colors.n[k]; i > -1 && i < 256;) {
				//if(k == 0 && i > 128) i = 128; // 去除左边的白色

				switch(colors.c[k]) {
					case 'r': r = i; break;
					case 'b': b = i; break;
					case 'g': g = i; break;
				}

				color = 'rgb('+r+','+b+','+g+')';
				linear = ctx.createLinearGradient(n, 0, n, halfH);
				linear.addColorStop(0, '#fff');
				linear.addColorStop(1, color);
				ctx.fillStyle = linear;
				ctx.fillRect(n, 0, n, halfH);

				linear = ctx.createLinearGradient(n, halfH, n, h);
				linear.addColorStop(0, color);
				linear.addColorStop(1, '#000');
				ctx.fillStyle = linear;
				ctx.fillRect(n, halfH, n, h);

				if(colors.n[k] == 255) i -= ratio;
				else i += ratio;
				n++;
			}
		}
		
		return true;
	}
	
	// 简单的拾色器，用于不支持HTML5 Canvas的浏览器
	function createSimplePicker(obj) {
		var arr = ['0','5','a','f'], // 64色, ['0', '3', '7', 'b', 'f'] 125色
				html = '<div id="font_color" class="corlor-list">';

		for(var i in arr) {
			for(var j in arr) {
				for(var k in arr) {
					var c = arr[k]+arr[j]+arr[i];
					html += '<div name="'+c+'" style="background-color:#'+c+'"></div>';
				}
			}
		}
		html += '</div>';
		
		$(obj).html(html);
	}

	// 十进制转16进制，保持2的长度
	function dechex(num) {
		var r = Math.round(num).toString(16);
		return r.length == 1 ? '0'+r : r;
	}

	// 计算某个点上的 RGB 颜色
	function getPointRGB(x, y, halfH) {
		// x += len / 2; // 去白时需要补差
		var mod = x % len * ratio,
				n = Math.floor(x / len),
				temp = 0,
				r = Math.abs(y - halfH) / halfH; // Y 轴渐变计算，上半部分向白色渐变 RGB向255靠拢，下半部分向黑色渐变 RGB向0 靠拢
		
		// 0-255和255-0 的渐变过程差异判断
		if(colors.n[n] == 255) mod = 255 - mod;
		
		for(var k in rgb) {
			// 渐变色和非渐变色区分
			temp = colors.c[n] == k ? dechex(mod) : colors[k][n];
			
			temp = parseInt(temp, 16) * (1 - r);
			if(y < halfH) temp += 255 * r;
			
			rgb[k] = dechex(temp);
		}
		return rgb.r+rgb.b+rgb.g;
	}
})(jQuery);