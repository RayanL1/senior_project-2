


if (localStorage.getItem('token')) { 
    history.go(-1)
    document.location.replace(  (localStorage.getItem('isAdmin') == 'true') ? "/admin/mainadmin" : "/dashboard")
}



const loginForm = document.getElementById("login-form")
loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const password = document.getElementById("password")
    const email = document.getElementById("email")

    fetch("login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            password: password.value,
            email: email.value
        })
    })
        .then(async (data) => {
            const responseBody = await data.json();
            if (!data.ok) {
                throw new Error(responseBody.error);
            }
            return responseBody;
        })
        .then(data => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("isAdmin", data.isAdmin);
            localStorage.setItem("fulldata", JSON.stringify(data.user))
            history.go(-1)
            document.location.replace( data.isAdmin ? "/admin/mainadmin" : "/dashboard")
           
        })
        .catch((error) => {
            alert(error);
        });
});


