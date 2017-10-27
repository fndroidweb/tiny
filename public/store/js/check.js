window.onload=function(){
	var usern=window.localStorage.getItem("Username");
	var pass=window.localStorage.getItem("Password");
	if(usern == null||pass == null){
		window.location.href="404.html";
	}
}
