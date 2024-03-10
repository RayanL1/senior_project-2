
const SubmitcertificatesInfoModal = document.getElementById("SubmitcertificatesInfoModal")
SubmitcertificatesInfoModal.onclick = () => {
  const fileInput = document.getElementById('certificates-file');
  const file = fileInput.files[0];
  if (!file) return;
  const data = new FormData()
  data.append('file', file)
  data.append('name', document.getElementById("certificates-name").value)
  data.append('desc', document.getElementById("certificates-desc").value)
  data.append('token', localStorage.getItem("token"))
  fetch("/certificates", {
    method: "post", body: data
  }).then(async res => {
    if (res.ok) {
      alert(await res.text())
      window.location.reload();
    }
  })
    .catch(err => alert(err))

}

const SubmitProject = document.getElementById("SubmitProject")
SubmitProject.onclick = () => {
  const fileInput = document.getElementById('project-file');
  const file = fileInput.files[0];
  if (!file) return;
  const data = new FormData()
  data.append('file', file)
  data.append('name', document.getElementById("project-name").value)
  data.append('desc', document.getElementById("project-desc").value)
  data.append('token', localStorage.getItem("token"))
  fetch("/project", {
    method: "post", body: data
  }).then(async res => { if (res.ok) { alert(await res.text()); window.location.reload() } })
    .catch(err => alert(err))
}

const SubmitPersonal = document.getElementById("SubmitPersonal")
SubmitPersonal.onclick = () => {
  const fileInput = document.getElementById('profile-file');
  const file = fileInput.files[0];
  const data = new FormData()
  if (file) data.append('file', file)
  data.append('name', document.getElementById("personal-name").value)
  data.append('major', document.getElementById("personal-major").value)
  data.append('about', document.getElementById("personal-about").value)
  data.append('email', document.getElementById("personal-email").value)
  data.append('token', localStorage.getItem("token"))
  fetch("/personal", {
    method: "post",
    body: data
  }).then(async (data) => {
    const responseBody = await data.json();
    if (!data.ok) {
      throw new Error(responseBody.error);
    }
    return responseBody;
  })
    .then(data => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("fulldata", JSON.stringify(data.user))
      alert('Personal Information Saved Succesfully')
      window.location.reload()
    })
    .catch((error) => {
      alert(error);
    });
}

function setUserValues() {
  let user = localStorage.getItem('fulldata')
  if (user) {
    user = JSON.parse(user)
    document.getElementById("personal-name").value = user.username
    document.getElementById("personal-major").value = user.major
    document.getElementById("personal-about").value = user.about ?? ''
    document.getElementById("personal-email").value = user.email
  }
}
document.addEventListener("DOMContentLoaded", setUserValues);