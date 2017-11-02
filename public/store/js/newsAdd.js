layui.config({
	base: "js/"
}).use(['form', 'layer', 'jquery', 'laypage'], function() {
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		laypage = layui.laypage,
		$ = layui.jquery,
		requireid;
	

	var Token = window.localStorage.getItem("tk");
	var upload_detail = '';
	console.log(token);
	$(".uploadpro").click(function() {

		var formData = new FormData();
		formData.append('sale', $('input[name=sale]')[0].files[0]);
		formData.append('token', Token);
		console.log(formData);
		$.ajax({
			url: 'http://tiny.fndroid.com:6886/esl/uploadexcell',
			type: 'post',
			cache: false,
			data: formData,
			processData: false,
			contentType: false
		}).done(function(db) {
			if(db.result_code == 200) {
				layer.alert('上传成功', {
					icon: 6,
					title: '温馨提示'
				});
				$("#req_id").html(db.req_id);
				upload_detail = db.result_msg;
				requireid=db.req_id;
				newsList();
				update_status();
				refresh(requireid);
			} else if(db.result_code == 607) {
				layer.alert('您必须先登录', {
					icon: 6,
					title: '温馨提示'
				});
			} else if(db.result_code == 612) {
				layer.alert('文件格式错误', {
					icon: 6,
					title: '温馨提示'
				});
			}
		});

	})

	function newsList(that) {
		//渲染数据
		console.log(upload_detail);
		var dataHtml = '';
		currData = upload_detail;

		console.log(currData);
		if(currData.length != 0) {
			for(var i = 0; i < currData.length; i++) {
				if(typeof currData[i].group_name == 'object') {
					currData[i].group_name = currData[i].group_name[0] + '→' + '<span style="color:red;">' + currData[i].group_name[1] + '</span>';
				}
				if(typeof currData[i].sale_price == 'object') {
					currData[i].sale_price = currData[i].sale_price[0] + '→' + '<span style="color:red;">' + currData[i].sale_price[1] + '</span>';
				}
				if(typeof currData[i].original_price == 'object') {
					currData[i].original_price = currData[i].original_price[0] + '→' + '<span style="color:red;">' + currData[i].original_price[1] + '</span>';
				}
				if(typeof currData[i].barcode == 'object') {
					currData[i].barcode = currData[i].barcode[0] + '→' + '<span style="color:red;">' + currData[i].barcode[1] + '</span>';
				}
				if(typeof currData[i].name == 'object') {
					currData[i].name = currData[i].name[0] + '→' + '<span style="color:red;">' + currData[i].name[1] + '</span>';
				}
				if(typeof currData[i].leaguer_price == 'object') {
					currData[i].leaguer_price = currData[i].leaguer_price[0] + '→' + '<span style="color:red;">' + currData[i].leaguer_price[1] + '</span>';
				}
				if(typeof currData[i].unit == 'object') {
					currData[i].unit = currData[i].unit[0] + '→' + '<span style="color:red;">' + currData[i].unit[1] + '</span>';
				}
				if(typeof currData[i].discount_node == 'object') {
					currData[i].discount_node = currData[i].discount_node[0] + '→' + '<span style="color:red;">' + currData[i].discount_node[1] + '</span>';
				}
				if(typeof currData[i].origin == 'object') {
					currData[i].origin = currData[i].origin[0] + '→' + '<span style="color:red;">' + currData[i].origin[1] + '</span>';
				}
				if(typeof currData[i].level == 'object') {
					currData[i].level = currData[i].level[0] + '→' + '<span style="color:red;">' + currData[i].level[1] + '</span>';
				}
				if(typeof currData[i].specification == 'object') {
					currData[i].specification = currData[i].specification[0] + '→' + '<span style="color:red;">' + currData[i].specification[1] + '</span>';
				}
				if(typeof currData[i].category == 'object') {
					currData[i].category = currData[i].category[0] + '→' + '<span style="color:red;">' + currData[i].category[1] + '</span>';
				}
				if(typeof currData[i].putstyle == 'object') {
					currData[i].putstyle = currData[i].putstyle[0] + '→' + '<span style="color:red;">' + currData[i].putstyle[1] + '</span>';
				}
				if(typeof currData[i].locate_str == 'object') {
					currData[i].locate_str = currData[i].locate_str[0] + '→' + '<span style="color:red;">' + currData[i].locate_str[1] + '</span>';
				}
				if(typeof currData[i].inner_code == 'object') {
					currData[i].inner_code = currData[i].inner_code[0] + '→' + '<span style="color:red;">' + currData[i].inner_code[1] + '</span>';
				}
				if(typeof currData[i].promotion_start == 'object') {
					currData[i].promotion_start = currData[i].promotion_start[0] + '→' + '<span style="color:red;">' + currData[i].promotion_start[1] + '</span>';
				}
				if(typeof currData[i].promotion_end == 'object') {
					currData[i].promotion_end = currData[i].promotion_end[0] + '→' + '<span style="color:red;">' + currData[i].promotion_end[1] + '</span>';
				}
				if(typeof currData[i].price_employee == 'object') {
					currData[i].price_employee = currData[i].price_employee[0] + '→' + '<span style="color:red;">' + currData[i].price_employee[1] + '</span>';
				}
				if(typeof currData[i].supper_telphone == 'object') {
					currData[i].supper_telphone = currData[i].supper_telphone[0] + '→' + '<span style="color:red;">' + currData[i].supper_telphone[1] + '</span>';
				}
				if(typeof currData[i].print_date == 'object') {
					currData[i].print_date = currData[i].print_date[0] + '→' + '<span style="color:red;">' + currData[i].print_date[1] + '</span>';
				}
				if(typeof currData[i].exhibition == 'object') {
					currData[i].exhibition = currData[i].exhibition[0] + '→' + '<span style="color:red;">' + currData[i].exhibition[1] + '</span>';
				}
				if(typeof currData[i].shelf_position == 'object') {
					currData[i].shelf_position = currData[i].shelf_position[0] + '→' + '<span style="color:red;">' + currData[i].shelf_position[1] + '</span>';
				}
				if(typeof currData[i].inventory == 'object') {
					currData[i].inventory = currData[i].inventory[0] + '→' + '<span style="color:red;">' + currData[i].inventory[1] + '</span>';
				}
				if(typeof currData[i].supplier == 'object') {
					currData[i].supplier = currData[i].supplier[0] + '→' + '<span style="color:red;">' + currData[i].supplier[1] + '</span>';
				}
				dataHtml += '<tr>' +
					'<td>' + currData[i].group_name + '</td>' +
					'<td>' + currData[i].barcode + '</td>' +
					'<td>' + currData[i].name + '</td>' +
					'<td>' + currData[i].sale_price + '</td>' +
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
					'<td>' + currData[i].promotion_start + '</td>' +
					'<td>' + currData[i].promotion_end + '</td>' +
					'<td>' + currData[i].price_employee + '</td>' +
					'<td>' + currData[i].supper_telphone + '</td>' +
					'<td>' + currData[i].print_date + '</td>' +
					'<td>' + currData[i].exhibition + '</td>' +
					'<td>' + currData[i].shelf_position + '</td>' +
					'<td>' + currData[i].inventory + '</td>' +
					'<td>' + currData[i].supplier + '</td>' +
					'</tr>';
			}
		} else {
			dataHtml = '暂无数据';
		}
		$(".detail_content").html(dataHtml);

	}
	
	function refresh(requireid) {
		//实时更新状态
		var getting = {
			type: "get",
			url: "http://tiny.fndroid.com:6886/esl/update/status",
			async: true,
			data: {
				'req_id': requireid,
				'token': Token
			},
			dataType: 'json',
			success: function(db) {
				if(db.result_code == 200) {
					var statusarray = [];
					var statuslist = db.result_msg;
	
					for(var i in statuslist) {

						statusarray.push(statuslist[i].status);
						var netstatuss = $(".status_content").find(".Status");
						$.each(netstatuss, function(key, value) {
							$(value).html(statusarray[key]);
						})
					}
				}
			}
		}
		
		window.setInterval(function() {
			$.ajax(getting)
		}, 10000);		
	}

	
	
	//查看更新状态

	function update_status() {
	console.log(requireid);
		
		$.ajax({
			type: "get",
			url: "http://tiny.fndroid.com:6886/esl/update/status",
			async: true,
			data: {
				'req_id': requireid,
				'token': Token
			},
			dataType: 'json',
			success: function(db) {
				if(db.result_code == 200) {
					var msglist = db.result_msg;

					for(var i in msglist) {
						var dataHtml;
						dataHtml += '<tr>' +
							'<td>' + msglist[i].name + '</td>' +
							'<td>' + msglist[i].barcode + '</td>' +
							'<td>' + msglist[i].sale_price + '</td>' +
							'<td class="Status">' + msglist[i].status + '</td>' +
							'</tr>';

						$(".status_content").html(dataHtml);
					}
				}
			}
		});
	}

})