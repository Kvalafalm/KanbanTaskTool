<!DOCTYPE html>

<html>
<head>
  <title>Beego</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    
    
    <link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script>
    <script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
    {{template "bootstrap.html" .}}    
    <link href="../static/css/login.css" rel="stylesheet">
</head>


<body>
  <div class="modal-dialog">
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
