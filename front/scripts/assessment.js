
const students = document.getElementById("students")
const send = document.getElementById("send-data")
const addToResult = document.getElementById("addToResults")
let users = [];
let results = {}

getUsers()

function getUsers() {
    fetch("/getUsers", {
        method: "post", headers: {
            "Content-Type": "application/json"
        }, body: JSON.stringify({ token: localStorage.getItem("token"), category: localStorage.getItem('category'), savedClass: localStorage.getItem('savedClass') })
    })
        .then(async data => {
            data = await data.json()
            users =data;
            data.forEach(user => {
                students.innerHTML += `<option data-id="${user.uId}" value="${user.id}">${user.name}</option>`
            });
        })
}

students.addEventListener('change',function (){
    let key = this.value;
    let user = users.find(e=>e.id ==key)
    if (user.coursesAssesment){
        const inputs = document.querySelectorAll('.group-leader td input')
        let values  = Object.values(user.coursesAssesment)
        inputs.forEach((e,i)=>{e.value = values[i]})
    }
})

send.addEventListener('click', function () {
    if (students.value == "none") return alert("Choice Student Please")
    let studentId = students.value
    const coursesAssesments = document.querySelectorAll('.group-leader')
    coursesAssesments.forEach(e => {
        let courseName = e.querySelectorAll('td')[0].textContent
        let assessment = e.querySelectorAll('td input')[0].value
        results[courseName] = assessment
    })
    let valueNotValid = Object.values(results).some(assessment => (assessment < 1 || assessment > 100))
    if (valueNotValid) { return alert("please enter valid values between 0 : 100") }

    let body = { studentId: studentId, results: results }
    fetch("/send-course-assessment", {
        method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    }).then(res => {
        if (res.ok) {
            alert('Assessments Saved Successfully')
            window.location.reload()
        }
    })
    return;

    // const coding = document.getElementById("coding").value;
    // const analysis = document.getElementById("analysis").value;
    // const design = document.getElementById("design").value;
    // if (!coding || !analysis || !design) { return alert("please enter skill assesment") }
    // if ((coding < 1 || coding > 100) || (analysis < 1 || analysis > 100) || (design < 1 || design > 100)) { return alert("please enter valid values between 0 : 100") }
    // const studentId = membersSelect.selectedOptions[0].value;
    // const studentName = membersSelect.selectedOptions[0].text;
    // const groupName = groupsSelect.selectedOptions[0].text;
    // const groupId = groupsSelect.selectedOptions[0].value;

    // results.push({ studentId: studentId, studentName: studentName, groupName: groupName, groupId: groupId, coding: coding, analysis: analysis, design: design })

    // const resultsBody = document.getElementById('results')
    // resultsBody.innerHTML = ''

    // results.forEach(e => {
    //     resultsBody.innerHTML += `<tr> <th>${e.studentName}</th> <th>${e.groupName}</th>  <th>${e.coding}</th> <th>${e.analysis}</th> <th>${e.design}</th> </tr>`;
    // })

    // for (var i = 0; i < membersSelect.length; i++) {
    //     if (membersSelect.options[i].value == studentId)
    //         membersSelect.remove(i);
    // }
});




