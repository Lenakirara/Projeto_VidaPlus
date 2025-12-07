document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const userInput = document.getElementById('user');
  const passInput = document.getElementById('passwd');

  const user = userInput.value.trim();
  const passwd = passInput.value.trim();

  const validUser = 'admin';
  const validPasswd = '123456';

  if(user === validUser && passwd === validPasswd){
    userInput.value = '';
    passInput.value = '';
    window.location.href = 'home.html';
  } else {
    alert('Usuário ou senha inválidos!');
    userInput.value = '';
    passInput.value = '';
    userInput.focus();
  }
});
