

function getUserInfo() {
  fetch("/getUser", {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ token: localStorage.getItem("token") })
  })
    .then(async res => {
      if (res.ok) {
        let data = await res.json()
        localStorage.setItem('fulldata', JSON.stringify(data))
        setUserInfo()
      }
      else {
        setUserInfo()
      }
    })
}

function setUserInfo(user) {
  if (!user) {
    user = JSON.parse(localStorage.getItem('fulldata'))
  }
  
  document.getElementById("about").innerHTML = user.about;
  document.getElementById("name").innerHTML = user.username;
  document.getElementById("username").innerHTML = user.username;
  document.getElementById("major").innerHTML = user.major;
  document.getElementById("email").innerHTML = user.email;
  document.getElementById("avatar").src = user.avatar || "/front/styles/images/Profilepicture.jpg";
  document.getElementById("icon").src = user.avatar || "/front/styles/images/Profilepicture.jpg";
  for (let key in user.languages) {
    document.getElementById(`${user.languages[key]}`).style.filter = "blur(0px)"
  }
  document.getElementById("coding").style.width = `${user.skills ? user.skills["coding"] : 0}%`
  document.getElementById("coding").innerText = `${user.skills ? user.skills["coding"] : 0}%`
  document.getElementById("design").style.width = `${user.skills ? user.skills["design"] : 0}%`
  document.getElementById("design").innerText = `${user.skills ? user.skills["design"] : 0}%`
  document.getElementById("analysis").style.width = `${user.skills ? user.skills["analysis"] : 0}%`
  document.getElementById("analysis").innerText = `${user.skills ? user.skills["analysis"] : 0}%`
  for (let key in user.projects) {
    document.getElementById("projects").innerHTML += `<div class="col-12 col-xl-4 col-lg-3 col-md-6">
      <!-- Certification 6 -->
      <div class="item card">
        <div><img src="${user.projects[key].url}" class="card-img-top" alt="Project Picture"><button onclick="deleteProject('${key}')"type="button" class="deleteBtn btn btn-default bg-white text-danger">
          <i class="fa-solid fa-trash"></i>
        </button></div> 
        <div class="card-body py-5">
        <h5 class="card-title text-body">${user.projects[key].name}</h5>
        <p class="card-text text-black-50">${user.projects[key].desc}</p>
      </div>
      </div>
    </div>`
  }
  for (let key in user.certificates) {
    document.getElementById("certificates").innerHTML += `<div class="col-12 col-xl-4 col-lg-3 col-md-6">
      <!-- Certification 6 -->
      <div class="item card">
        <div><img src="${user.certificates[key].url}" class="card-img-top" alt="Certificate Picture"><button onclick="deleteCertificate('${key}')" type="button" class="deleteBtn btn btn-default bg-white text-danger">
        <i class="fa-solid fa-trash"></i>
        </button></div>
        <div class="item-content">
          <h3>${user.certificates[key].name}</h3>
        </div>
      </div>
    </div>`
  }
}

function deleteProject(key) {
  let userId = JSON.parse(localStorage.getItem('fulldata')).id
  fetch("/deleteProject", {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ id: key, userId: userId })
  })
    .then(async res => {
      if (res.ok) { alert("Deleted successfully"); window.location.reload() }
    })
}

function deleteCertificate(key) {
  let userId = JSON.parse(localStorage.getItem('fulldata')).id
  fetch("/deleteCertificate", {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ id: key ,userId: userId})
  })
    .then(async res => {
      if (res.ok) { alert("Deleted successfully"); window.location.reload() }
    })
}


document.addEventListener("DOMContentLoaded", getUserInfo);