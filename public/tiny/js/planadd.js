//选择商品类型
$(".choose_pro label input").click(function() {
	if($(this).val() == "单个商品") {
		$(".barcode").css("display", "block");
		$(".category").css("display", "none");
	} else if($(this).val() == "一类商品") {
		$(".barcode").css("display", "none");
		$(".category").css("display", "block");
	} else {
		$(".barcode").css("display", "none");
		$(".category").css("display", "none");
	}

})


//选择时间类型
$(".choosePro label input").click(function() {
	if($(this).val() == "时间段方案") {
		$(".stimes_tart_end").css("display", "block");
		$(".stimes_tart").css("display", "none");
		$(".Stimes_tart").css("display", "none");
	} else if($(this).val() == "时间点方案") {
		$(".stimes_tart_end").css("display", "none");
		$(".stimes_tart").css("display", "block");
		$(".Stimes_tart").css("display", "none");
	}else if($(this).val() == "时间周期方案") {
		$(".stimes_tart_end").css("display", "none");
		$(".stimes_tart").css("display", "none");
		$(".Stimes_tart").css("display", "block");
	}else{
		$(".stimes_tart_end").css("display", "none");
		$(".stimes_tart").css("display", "none");
		$(".Stimes_tart").css("display", "none");
	}

})


//根据barcode查看商品信息


$(".check_pro").click(function(){
	$.ajax({
		type:"get",
		url:"http://tiny.fndroid.com:6886/esl/sale/search",
		async:true,
		dataType:'json',
		data:{
			"barcode":$("#probarcode").val()
		},
		success:function(db){
			if (db.result_code==200) {
				var promsg = db.result_msg;
				$(".proname").html(promsg.name+':');
				$(".proprice").html(promsg.sale_price+'元');
			
			} else{
				alert("服务器出错");
			}
		}
	});
})