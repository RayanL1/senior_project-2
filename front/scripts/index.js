
let user = localStorage.getItem('fulldata')
let isAdmin = localStorage.getItem('isAdmin')
let path = window.location.pathname;


if (user) {
    user = JSON.parse(user)
    let nameSpan = document.getElementById("name")
    if (nameSpan) nameSpan.innerText = user.username
} else {
    localStorage.clear()
    sessionStorage.clear()
}

if (isAdmin == 'true' && user && path == '/') {history.go(-1) ;document.location.replace('/admin/mainadmin')}
if (isAdmin == 'false' && user && (path.includes('/admin/') || path == '/')) {history.go(-1);document.location.replace('/dashboard')} 

function logout() {
    localStorage.clear()
    sessionStorage.clear()
    history.go(-1)
    document.location.replace('/')
}

