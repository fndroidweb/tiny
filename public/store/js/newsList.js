layui.config({
	base: "js/"
}).use(['form', 'layer', 'jquery', 'laypage'], function() {
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		laypage = layui.laypage,
		$ = layui.jquery,
		Token = window.localStorage.getItem("tk"),
		barcode;

	//加载页面数据
	var prosData = '';
	$.ajax({
		url: "http://tiny.fndroid.com:6886/store/sku/get",
		type: "get",
		data:{
			"token":Token
		},
		dataType: "json",
		success: function(data) {
			if (data.result_code==200) {
				prosData = data.result_msg;
				//执行加载数据的方法
				console.log(prosData);
				newsList();
			} else{
				alert("网络错误");
			}


		}

	})

	//查询
	$(".search_btn").click(function() {
		var newArray = [];
		if($(".search_input").val() != '') {
			var index = layer.msg('查询中，请稍候', {
				icon: 16,
				time: false,
				shade: 0.8
			});
			setTimeout(function() {
				$.ajax({
					url: "http://tiny.fndroid.com:6886/store/sku/get",
					type: "get",
					data:{
						"token":Token
					},
					dataType: "json",
					success: function(data) {
						prosData = data.result_msg;
						for(var i = 0; i < prosData.length; i++) {
							var newsStr = prosData[i];
							var selectStr = $(".search_input").val();

							function changeStr(data) {
								var dataStr = '';
								var showNum = data.split(eval("/" + selectStr + "/ig")).length - 1;
								if(showNum > 1) {
									for(var j = 0; j < showNum; j++) {
										dataStr += data.split(eval("/" + selectStr + "/ig"))[j] + "<i style='color:#03c339;font-weight:bold;'>" + selectStr + "</i>";
									}
									dataStr += data.split(eval("/" + selectStr + "/ig"))[showNum];
									return dataStr;
								} else {
									dataStr = data.split(eval("/" + selectStr + "/ig"))[0] + "<i style='color:#03c339;font-weight:bold;'>" + selectStr + "</i>" + data.split(eval("/" + selectStr + "/ig"))[1];
									return dataStr;
								}
							}
							if(newsStr.name.indexOf(selectStr) > -1) {
								newsStr["name"] = changeStr(newsStr.name);
							}
							if(newsStr.origin.indexOf(selectStr) > -1) {
								newsStr["origin"] = changeStr(newsStr.origin);
							}
							if(newsStr.locate_str.indexOf(selectStr) > -1) {
								newsStr["locate_str"] = changeStr(newsStr.locate_str);
							}
							if(newsStr.exhibition.indexOf(selectStr) > -1) {
								newsStr["exhibition"] = changeStr(newsStr.exhibition);
							}
							if(newsStr.shelf_position.indexOf(selectStr) > -1) {
								newsStr["shelf_position"] = changeStr(newsStr.shelf_position);
							}
							if(newsStr.supplier.indexOf(selectStr) > -1) {
								newsStr["supplier"] = changeStr(newsStr.supplier);
							}
							if(newsStr.name.indexOf(selectStr) > -1 || newsStr.origin.indexOf(selectStr) > -1 || newsStr.locate_str.indexOf(selectStr) > -1 || newsStr.exhibition.indexOf(selectStr) > -1 || newsStr.shelf_position.indexOf(selectStr) > -1 || newsStr.supplier.indexOf(selectStr) > -1) {
								newArray.push(newsStr);
							}
						}
						prosData = newArray;
						newsList(prosData);
					}
				})

				layer.close(index);
			}, 2000);
		} else {
			layer.msg("请输入需要查询的内容");
		}
	})

	$(window).one("resize", function() {
		$(".newsAdd_btn").click(function() {
			var index = layui.layer.open({
				title: "添加商品",
				type: 2,
				content: "newsAdd.html",
				success: function(layero, index) {
					setTimeout(function() {
						layui.layer.tips('点击此处返回商品列表', '.layui-layer-setwin .layui-layer-close', {
							tips: 3
						});
					}, 500)
				}
			})
			//改变窗口大小时，重置弹窗的高度，防止超出可视区域（如F12调出debug的操作）
			$(window).resize(function() {
				layui.layer.full(index);
			})
			layui.layer.full(index);
		})
	}).resize();

	//批量删除
	$(".batchDel").click(function() {
		var $checkbox = $('.news_list tbody input[type="checkbox"][name="checked"]');
		var $checked = $('.news_list tbody input[type="checkbox"][name="checked"]:checked');
		if($checkbox.is(":checked")) {
			layer.confirm('确定删除选中的信息？', {
				icon: 3,
				title: '提示信息'
			}, function(index) {
				var index = layer.msg('删除中，请稍候', {
					icon: 16,
					time: false,
					shade: 0.8
				});
				setTimeout(function() {
					//删除数据
					for(var j = 0; j < $checked.length; j++) {
						for(var i = 0; i < newsData.length; i++) {
							if(newsData[i].newsId == $checked.eq(j).parents("tr").find(".news_del").attr("data-id")) {
								newsData.splice(i, 1);
								newsList(newsData);
							}
						}
					}
					$('.news_list thead input[type="checkbox"]').prop("checked", false);
					form.render();
					layer.close(index);
					layer.msg("删除成功");
				}, 2000);
			})
		} else {
			layer.msg("请选择需要删除的文章");
		}
	})

	//全选
	form.on('checkbox(allChoose)', function(data) {
		var child = $(data.elem).parents('table').find('tbody input[type="checkbox"]:not([name="show"])');
		child.each(function(index, item) {
			item.checked = data.elem.checked;
		});
		form.render('checkbox');
	});

	//通过判断文章是否全部选中来确定全选按钮是否选中
	form.on("checkbox(choose)", function(data) {
		var child = $(data.elem).parents('table').find('tbody input[type="checkbox"]:not([name="show"])');
		var childChecked = $(data.elem).parents('table').find('tbody input[type="checkbox"]:not([name="show"]):checked')
		if(childChecked.length == child.length) {
			$(data.elem).parents('table').find('thead input#allChoose').get(0).checked = true;
		} else {
			$(data.elem).parents('table').find('thead input#allChoose').get(0).checked = false;
		}
		form.render('checkbox');
	})

	//操作
	$("body").on("click", ".news_edit", function() { //编辑
		layer.alert('您点击了文章编辑按钮，由于是纯静态页面，所以暂时不存在编辑内容，后期会添加，敬请谅解。。。', {
			icon: 6,
			title: '文章编辑'
		});
	})

	$("body").on("click", ".news_del", function() { //删除
		var _this = $(this);
		layer.confirm('确定删除此信息？', {
			icon: 3,
			title: '提示信息'
		}, function(index) {
			//_this.parents("tr").remove();
			for(var i = 0; i < newsData.length; i++) {
				if(newsData[i].newsId == _this.attr("data-id")) {
					newsData.splice(i, 1);
					newsList(newsData);
				}
			}
			layer.close(index);
		});
	})

	function newsList(that) {
		//渲染数据
		function renderDate(data, curr) {
			var dataHtml = '';
			if(!that) {
				currData = prosData.concat().splice(curr * nums - nums, nums);
			} else {
				currData = that.concat().splice(curr * nums - nums, nums);
			}
			if(currData.length != 0) {
				for(var i = 0; i < currData.length; i++) {

					currData[i].print_date = currData[i].print_date.split("T")[0];

					if(typeof currData[i].category == "undefined") {
						currData[i].category = "-";
					}
					if(typeof currData[i].putstyle == "undefined") {
						currData[i].putstyle = "-";
					}
					if(typeof currData[i].discount_node == "undefined") {
						currData[i].discount_node = "-";
					}
					dataHtml += '<tr>' +
						'<td><input type="checkbox" name="checked" lay-skin="primary" lay-filter="choose"></td>' +
						'<td>' + currData[i].barcode + '</td>' +
						'<td>' + currData[i].name + '</td>' +
						'<td onclick="toReplace(this)">' + currData[i].sale_price + '</td>' +
						'<td>' + currData[i].original_price + '</td>' +
						'<td>' + currData[i].reduction_reason + '</td>' +
						'<td>' + currData[i].leaguer_price + '</td>' +
						'<td>' + currData[i].unit + '</td>' +
						'<td>' + currData[i].discount_node + '</td>' +
						'<td>' + currData[i].origin + '</td>' +
						'<td>' + currData[i].level + '</td>' +
						'<td>' + currData[i].specification + '</td>' +
						'<td>' + currData[i].category + '</td>' +
						'<td>' + currData[i].putstyle + '</td>' +
						'<td>' + currData[i].locate_str + '</td>' +
						'<td>' + currData[i].inner_code + '</td>' +
						'<td>' + currData[i].price_employee + '</td>' +
						'<td>' + currData[i].supper_telphone + '</td>' +
						'<td>' + currData[i].print_date + '</td>' +
						'<td>' + currData[i].exhibition + '</td>' +
						'<td>' + currData[i].shelf_position + '</td>' +
						'<td>' + currData[i].inventory + '</td>' +
						'<td>' + currData[i].supplier + '</td>' +
						'<td>' +
						'<a class="layui-btn layui-btn-danger layui-btn-mini news_del"><i class="layui-icon">&#xe640;</i> 删除</a>' +
						'</td>' +
						'</tr>';
				}
			} else {
				dataHtml = '暂无数据';
			}
			return dataHtml;
		}

		//分页
		var nums = 10; //每页出现的数据量
		if(that) {
			prosData = that;
		}
		laypage({
			cont: "page",
			pages: Math.ceil(prosData.length / nums),
			jump: function(obj) {
				$(".news_content").html(renderDate(prosData, obj.curr));
				$('.news_list thead input[type="checkbox"]').prop("checked", false);
				form.render();
			}
		})
	}

	//修改价格
	toReplace = function(element) {
		var index = $(element).parent().index();
		barcode = currData[index].barcode;

		var oldhtml = element.innerHTML;
		var newobj = document.createElement('input');

		//创建新的input元素
		newobj.type = 'text';
		newobj.style.width = "50px";
		//为新增元素添加类型
		newobj.onblur = function() {
			element.innerHTML = this.value ? this.value : oldhtml;
			//当触发时判断新增元素值是否为空，为空则不修改，并返回原有值 
			$.ajax({
				type: "post",
				url: "http://tiny.fndroid.com:6886/store/price",
				dataType: "json",
				data: {
					"token": Token,
					"barcode": barcode,
					"price": this.value
				},
				async: true,
				success: function(db) {
					if(db.result_code==200) {
						alert("价格修改成功");
					} else if(db.result_code==805){
						alert("价格不能为空");
					}else if(db.result_code==607){
						alert("请重新登录");
					}
				}
			});
		}
		element.innerHTML = '';
		element.appendChild(newobj);
		newobj.focus();
	}
})