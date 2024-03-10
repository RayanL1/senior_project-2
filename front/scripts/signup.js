
if (localStorage.getItem('token')) { 
    history.go(-1)
    document.location.replace(  (localStorage.getItem('isAdmin') == 'true') ? "/admin/mainadmin" : "/dashboard")
}



const signup = document.getElementById("signup")

const signupForm = document.getElementById("signup-form")

signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const repassword = document.getElementById("repassword");
    const userClass = document.getElementById("class");
    const major = document.getElementById("major");
    if(major == '' || userClass == '') return alert('Please compleate the required fields')
    if (password.value !== repassword.value) { return alert("password must be asame"); }

    const body = JSON.stringify({
        username: username.value,
        email: email.value,
        repassword: repassword.value,
        password: password.value,
        major: major.value,
        class: userClass.value,
    })
    fetch("/signup", {
        method: "POST",
        body: body,
        headers: { "Content-Type": "application/json" },
    })
        .then(async (res) => {
            if (!res.ok) { throw new Error((await res.json()).error) }
            return res.json();
        })
        .then((_) => {
            window.location.href = "/login";
        })
        .catch((err) => { alert(err); });
});