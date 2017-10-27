layui.config({
	base: "js/"
}).use(['form', 'layer', 'jquery', 'laypage'], function() {
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		laypage = layui.laypage,
		$ = layui.jquery,
		requireid,
		proType,
		scheme_type,
		start_time,
		endtime,
		sign;
		
		

	var Token = window.localStorage.getItem("tk");
	var upload_detail = '';

	//选择商品类型
	$(".choose_pro label input").click(function() {
		if($(this).val() == "单个商品") {
			$(".barcode").css("display", "block");
			$(".category").css("display", "none");
			proType=1;
			
		} else if($(this).val() == "一类商品") {
			$(".barcode").css("display", "none");
			$(".category").css("display", "block");
			proType=2;	
		} else {
			$(".barcode").css("display", "none");
			$(".category").css("display", "none");
			proType=0;
			
		}

	})
	
	
	//选择折扣
	
	$(".choose_price label input").click(function(){
		if($(this).val() == "价格") {
			$(".discount").css("display", "none");
			$(".price").css("display", "block");
			
		}else{
			$(".discount").css("display", "block");
			$(".price").css("display", "none");	
		}
	})

	//选择时间类型
	$(".choosePro label input").click(function() {
		if($(this).val() == "时间点方案") {
			$(".stimes_tart_end").css("display", "none");
			$(".stimes_tart").css("display", "block");
			$(".Stimes_tart").css("display", "none");
			scheme_type=1;
			sign=1;
		} else if($(this).val() == "时间段方案") {
			$(".stimes_tart_end").css("display", "block");
			$(".stimes_tart").css("display", "none");
			$(".Stimes_tart").css("display", "none");
			sign=2;
			scheme_type=2;
		}else if($(this).val() == "时间周期方案") {
			$(".stimes_tart_end").css("display", "none");
			$(".stimes_tart").css("display", "none");
			$(".Stimes_tart").css("display", "block");
			scheme_type=3;
			sign=3;
			
		}else {
			$(".stimes_tart_end").css("display", "none");
			$(".stimes_tart").css("display", "none");
			$(".Stimes_tart").css("display", "none");
		}

	})
	//根据barcode查看商品信息

	$(".check_pro").click(function() {
		

		$.ajax({
			type: "get",
			url: "http://tiny.fndroid.com:6886/esl/sale/search",
			async: true,
			dataType: 'json',
			data: {
				"barcode": $("#probarcode").val()
			},
			success: function(db) {
				if(db.result_code == 200) {
					var promsg = db.result_msg;
					$(".proname").html(promsg.name + ':');
					$(".proprice").html(promsg.sale_price + '元');

				} else {
					alert("服务器出错");
				}
			}
		});
	})


	//添加方案
	
	$(".Addbtn").click(function(){
		if (sign==1) {
			start_time=Date.parse(new Date($("#startTime").val()));
			start_time = start_time / 1000;
		} else if(sign==2){
			start_time=Date.parse(new Date($("#start-time").val()));
			start_time = start_time / 1000;	
			endtime=Date.parse(new Date($("#endtime").val()));
			endtime = endtime / 1000;
			
		} else if(sign==3){
			start_time=Date.parse(new Date($("#Start_time").val()));
			start_time = start_time / 1000;	
			endtime=Date.parse(new Date($("#end_time").val()));
			endtime = endtime / 1000;
		}
		$.ajax({
			type:"post",
			url:"http://tiny.fndroid.com:6886/esl/scheme/add",
			dataType:"json",
			data:{
				"token":Token,
				"name":$("#project_name").val(),
				"sku_type":proType,
				"category":$("#category_style option:selected").text(),
				"barcode":$("#probarcode").val(),
				"scheme_type":scheme_type,
				"start_time":start_time,
				"end_time":endtime,
				"price":$("#proprice").val(),
				"cycle_time":$("#cycletime").val(),
				"discount":$("#prodiscount").val()
			},
			async:true,
			success:function(db){
				if (db.result_code==200) {
					//弹出loading
			 		var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
			        setTimeout(function(){
			            top.layer.close(index);
						top.layer.msg("方案添加成功！");
			 			layer.closeAll("iframe");
				 		//刷新父页面
				 		parent.location.reload();
			        },2000);
			 		return false;
				} else{
					alert(db.result_code);
				}
			}
		});
	})
	
})