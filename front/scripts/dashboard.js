
function getUser() {
    return fetch("/getUser", {
        method: "post", headers: {
            "Content-Type": "application/json"
        }, body: JSON.stringify({ token: localStorage.getItem("token") })
    })
        .then(async data => {
            let user = await data.json()

           
            document.getElementById('ind-analysis').value = user.skills? user.skills.analysis:0
            document.getElementById('ind-design').value =  user.skills?user.skills.design:0
            document.getElementById('ind-coding').value = user.skills?user.skills.coding:0

            if (!user.coursesAssesment) {
                user.coursesAssesment = {
                    "Advance Topics on Software Engineering": "0",
                    "Cloud Computing": "0",
                    "Software Construction": "0",
                    "Software Testing & Validation": "0",
                    "User Experience": "0",
                }
            }
            const coursesAssessment = document.getElementById('coursesAssessment')
            Object.entries(user.coursesAssesment).forEach(entry => {
                coursesAssessment.innerHTML += `<div class="col-md-4">
                    <h3 class="main-title h4">${entry[0]}</h3>
                    <circle-progress value="${entry[1]}" max="100" text-format="percent"></circle-progress>
                    </div>`
            })

            const circleProgress = document.getElementsByTagName('circle-progress')
            for (let index = 0; index < circleProgress.length; index++) {
                const circle = circleProgress[index];
                const svg = circle.shadowRoot.querySelector('svg')
                svg.setAttribute('height', '200px')
                svg.setAttribute('width', '200px')
                svg.querySelector('path').style.stroke = '#3498db'
            }
        })
}


document.addEventListener("DOMContentLoaded", function () {
    const circleProgress = document.getElementsByTagName('circle-progress')
    for (let index = 0; index < circleProgress.length; index++) {
        const circle = circleProgress[index];
        const svg = circle.shadowRoot.querySelector('svg')
        svg.setAttribute('height', '200px')
        svg.setAttribute('width', '200px')
        svg.querySelector('path').style.stroke = '#3498db'
    }
    getUser()
});

