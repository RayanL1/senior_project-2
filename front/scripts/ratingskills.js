const students = document.getElementById("students")
const send = document.getElementById("send-data")
const addToResult = document.getElementById("addToResults")
let results = []
let users = [];


fetch("/getUsers", {
    method: "post", headers: {
        "Content-Type": "application/json"
    }, body: JSON.stringify({ token: localStorage.getItem("token"), category: localStorage.getItem('category'), savedClass: localStorage.getItem('savedClass') })
})
    .then(async data => {
        data = await data.json()
        users = data;
        data.forEach(user => {
            students.innerHTML += `<option data-id="${user.uId}" value="${user.id}">${user.name}</option>`
        });
    })

    students.addEventListener('change', function () {
        let key = this.value;
        let user = users.find(e => e.id == key)
        if (user.skills) {
            document.getElementById("coding").value = user.skills.coding;
            document.getElementById("analysis").value = user.skills.analysis;
            document.getElementById("design").value = user.skills.design;
        }
    })
addToResults.onclick = () => {
    if (students.value == "none") return alert("Choice Student Please")
    const coding = document.getElementById("coding").value;
    const analysis = document.getElementById("analysis").value;
    const design = document.getElementById("design").value;
    if (!coding || !analysis || !design) { return alert("please enter skill assesment") }
    if ((coding < 1 || coding > 100) || (analysis < 1 || analysis > 100) || (design < 1 || design > 100)) { return alert("please enter valid values between 0 : 100") }

    const studentId = students.selectedOptions[0].value;
    const studentuId = students.selectedOptions[0].getAttribute("data-id");
    const studentName = students.selectedOptions[0].text;
    results.push({ studentuId: studentuId, studentId: studentId, studentName: studentName, coding: coding, analysis: analysis, design: design })

    const resultsBody = document.getElementById('results')
    resultsBody.innerHTML = ''

    results.forEach(e => {
        resultsBody.innerHTML += `<tr> <th>${e.studentName}</th> <th>${e.studentuId}</th> <th>${e.coding}</th> <th>${e.analysis}</th> <th>${e.design}</th> </tr>`;
    })

    for (var i = 0; i < students.length; i++) {
        if (students.options[i].value == studentId)
            students.remove(i);
    }

}


send.onclick = () => {
    if (results.length == 0) return alert("results is empty")
    fetch("/send-data", {
        method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify(results)
    }).then(res => {
        if (res.ok) {
            alert('Data Saved Successfully')
            window.location.reload()
        }
    })
}

