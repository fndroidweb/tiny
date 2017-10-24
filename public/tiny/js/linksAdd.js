layui.config({
	base : "js/"
}).use(['form','layer','jquery','layedit','laydate'],function(){
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		laypage = layui.laypage,
		layedit = layui.layedit,
		laydate = layui.laydate,
		$ = layui.jquery;

	//创建一个编辑器
	var to_ken=window.localStorage.getItem("token");
 	var editIndex = layedit.build('links_content');
 	var addLinksArray = [],addLinks;
 	$(".addstore").click(function(){
 		$.ajax({
			type:"post",
			url:"http://tiny.fndroid.com:6886/store/add",
			dataType:'json',
			data:{
				"store_name":$(".storeName").val(),
				"area":$(".storeArea").val(),
				"address":$(".storeAddress").val(),
				"phone":$(".storePhone").val(),
				"contact":$(".storeContact").val(),
				"desc":$(".storeinfo").val(),
				"mac":$(".storeMac").val(),
				"passwd":$(".storePas").val(),
				"token":to_ken
			},
			async:true,
			success:function(db){
				if (db.result_code==200) {
			 		//弹出loading
			 		var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
			        setTimeout(function(){
			            top.layer.close(index);
						top.layer.msg("门店添加成功！");
			 			layer.closeAll("iframe");
				 		//刷新父页面
				 		parent.location.reload();
			        },2000);
			 		return false;
				}else if(db.result_code==600){
					top.layer.msg("门店名称已存在");
				}else if(db.result_code==500){
					top.layer.msg("添加失败");
					
				}
				
			}
		});
 	})


	
})
