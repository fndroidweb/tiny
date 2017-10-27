//修改分店密码
layui.config({
	base: "js/"
}).use(['form', 'layer', 'jquery', 'laypage'], function() {
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		laypage = layui.laypage,
		$ = layui.jquery
		Token = window.localStorage.getItem("tk");
		
		
	$(".changePassword").click(function(){
		if($(".pwd").val()!==$(".repeatpwd").val()){
			layer.alert('两次输入密码不一致', {
				icon: 6,
				title: '温馨提示'
			});
		}
		$.ajax({
			type:"post",
			url:"http://tiny.fndroid.com:6886/store/changepassword",
			async:true,
			dataType:"json",
			data:{
				"passwd":$(".pwd").val(),
				"repeatpasswd":$(".repeatpwd").val(),
				"token":Token
			},
			success:function(db){
				if (db.result_code==200) {
					layer.alert('密码修改成功', {
						icon: 6,
						title: '温馨提示'
					});
				} else{
					layer.alert('密码修改失败', {
						icon: 6,
						title: '温馨提示'
					});
				}
			}
		});
	})


})