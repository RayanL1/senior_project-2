
const skills = document.querySelectorAll(".item")
skills.forEach(skill => {
    skill.addEventListener("click", () => {
        if (skill.id == "save") {
            let languages = []
            skills.forEach(skil => {
                if (skil.style.backgroundColor == "rgb(105, 177, 244)") {
                    languages.push(skil.id)
                }
            })
            fetch("/save_languages", { method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: localStorage.getItem('token'), languages: languages }) })
                .then(async res => {
                    if (res.ok) {
                        const responseJson = await res.json()
                        localStorage.setItem('fulldata', JSON.stringify(responseJson.user))
                        alert('Skills Saved Successfully')
                        window.location.reload()
                    }
                })
        } else {
            if (skill.style.backgroundColor == "rgb(105, 177, 244)") {
                skill.style.backgroundColor = "#e0e0e0"
            } else {
                skill.style.backgroundColor = "#69b1f4"
            }
        }

    })
})


function setSkills() {
    let user = localStorage.getItem('fulldata')
    if (user) {
        let languages = JSON.parse(user).languages;
        skills.forEach(skill => {
            if (languages.includes(skill.id)) {
                skill.style.backgroundColor = "#69b1f4"
            }
        })
    }
}
document.addEventListener("DOMContentLoaded", setSkills);