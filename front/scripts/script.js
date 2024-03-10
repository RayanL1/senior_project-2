

// The personal information modal button start

const personalInfoModal = document.querySelector("#personalInfoModal");

const personalInfoButton = document.querySelector("#personalInfoButton");

const personalInfoClose = document.querySelector("#close-personalinfo-modal");

const upload = document.getElementById("upload")
const file = document.getElementById("file")
if (upload) {
  upload.onclick = () => file?.click()
}


if (personalInfoButton) {
  personalInfoButton.addEventListener("click", (e) => {
    personalInfoModal.style.display = "block";
  });
}

if (personalInfoButton) {
  personalInfoClose.addEventListener("click", (e) => {
    personalInfoModal.style.display = "none";
  });
}

const projectInfoModal = document.querySelector("#projectInfoModal");

const projectInfoButton = document.querySelector("#projectInfoButton");

const projectInfoClose = document.querySelector("#close-any-modal");

if (projectInfoButton) {
  projectInfoButton.addEventListener("click", (e) => {
    projectInfoModal.style.display = "block";
  });
}

if (projectInfoButton) {
  projectInfoClose.addEventListener("click", (e) => {
    projectInfoModal.style.display = "none";
  });
}
const CertificatesInfoModal = document.querySelector("#certificatesInfoModal");

const CertificatesInfoButton = document.querySelector(".upload-certificates");

const CertificatesInfoClose = document.querySelector("#close-certificates-modal");

if (CertificatesInfoButton) {
  CertificatesInfoButton.addEventListener("click", (e) => {
    CertificatesInfoModal.style.display = "block";
  });
}

if (CertificatesInfoButton) {
  CertificatesInfoClose.addEventListener("click", (e) => {
    CertificatesInfoModal.style.display = "none";
  });
}
const create_group = document.getElementById("create-group-button")
if (create_group) {
  create_group.onclick = () => document.getElementById("create-group-modal").style.display = "block"
  const create = document.getElementById("group-modal-submit")
  create.onclick = () => {
    fetch("/create_group", {
      method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: document.getElementById("modal-form-name").value,
        maxusers: document.getElementById("max-members").value,
        token: localStorage.getItem("token")
      })
    })
  }
}
