layui.config({
	base: "js/"
}).use(['form', 'layer', 'jquery', 'laypage'], function() {
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		laypage = layui.laypage,
		$ = layui.jquery,
		Token = window.localStorage.getItem("token"),
		barcode;

	//加载页面数据
	var prosData = '';
	$.ajax({
		url: "http://tiny.fndroid.com:6886/esl/getallsales",
		type: "get",
		dataType: "json",
		success: function(data) {
			prosData = data.result_msg;
			//执行加载数据的方法
			newsList();
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
					url: "http://tiny.fndroid.com:6886/esl/getallsales",
					type: "get",
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
		$(".planAdd_btn").click(function() {
			var index = layui.layer.open({
				title: "添加变价方案",
				type: 2,
				content: "planadd.html",
				success: function(layero, index) {
					setTimeout(function() {
						layui.layer.tips('点击此处返回方案列表', '.layui-layer-setwin .layui-layer-close', {
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
				url: "http://tiny.fndroid.com:6886/esl/price",
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
					}
				}
			});
		}
		element.innerHTML = '';
		element.appendChild(newobj);
		newobj.focus();
	}
})