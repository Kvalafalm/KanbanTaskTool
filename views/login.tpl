<!DOCTYPE html>

<html>
<head>
  <title>Beego</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    

    {{template "bootstrap.html" .}}    
    <link href="../static/css/login.css" rel="stylesheet">
</head>


<body>
  <div class=" modal-dialog-centered">
		<div class="loginmodal-container">
			<h1>Login to Your Account</h1><br>
      <div id="result">{{.error}}</div>
      <form class="form-signin" method="post" action="/login/">
				<input type="text" name="UserName" placeholder="UserName">
				<input type="password" name="Password" placeholder="Password">
				<input type="submit" name="login" class="login loginmodal-submit" value="Login">
		  </form>
					
		  <div class="login-help">
  			<a href="#">Register</a> - <a href="#">Forgot Password</a>
		  </div>
		</div>
	</div>

</body>
</html>
