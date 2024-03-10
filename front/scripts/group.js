

function setMyGroup(courseName) {
  fetch("/getUser", {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ token: localStorage.getItem("token") })
  })
    .then(async res => {
      if (res.ok) {
        let user = await res.json()
        if (!user.groups) return;
        let group = Object.values(user.groups).find(e => e.courseName.toLowerCase() == courseName.toLowerCase())
        if (!group) { return; }
        document.getElementById('create-group-button').style.display = 'none';
        getGroup(group.key)

      }
    })
}

function getGroup(id) {
  fetch("/getGroup", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ id: id })
  }).then(async res => {
    if (res.ok) {
      let group = await res.json()
      setGroupMembers(Object.values(group.members), group.name)
    }
  })
}

async function setGroupMembers(members, groupName) {
  let userName = JSON.parse(localStorage.getItem("fulldata")).username
  let users = await getAllUsers()
  let membersIds = members.map(e => e.id)

  members.forEach(member => {
    document.getElementById("my-group").innerHTML += `<tr class="group-leader group-member">
      <td>${groupName}</td>
      <td>${member.user.uId}</td>
      <td>${member.user.username}</td>
      <td>${member.major}</td>
      <td>${user.skills && user.skills.analysis != '' ? user.skills.analysis : 0}</td>
      <td>${user.skills && user.skills.coding != '' ? user.skills.coding : 0}</td>
      <td>${user.skills && user.skills.design != '' ? user.skills.design : 0}</td>
    </tr>`
  })
  users.forEach(user => {
    if (!membersIds.includes(user.id)) {
      let isAlreadySent = Object.values(user.invites ? user.invites : []).find(e => e.group == groupName && e.inviter == userName) != undefined
      document.getElementById("members").innerHTML += `<tr class="group-leader group-member">
      <td>${user.username}</td>
      <td>${user.uId}</td>
      <td>${user.major}</td>
      <td>${user.skills && user.skills.analysis != '' ? user.skills.analysis : 0}</td>
      <td>${user.skills && user.skills.coding != '' ? user.skills.coding : 0}</td>
      <td>${user.skills && user.skills.design != '' ? user.skills.design : 0}</td>
      <td>${isAlreadySent ? 'Already Invited' : `<button class="invite-button" onclick="sendInvitation('${groupName}','${user.id}')">Invite</button>`}</td>
      <td></td>
      </tr>`
    }


  })
}

function getAllUsers() {
  return fetch("/getUsers", {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ token: localStorage.getItem("token") })
  })
    .then(async data => {
      let users = await data.json()
      return users;
    })
}

function getUser() {
  return fetch("/getUser", {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ token: localStorage.getItem("token") })
  })
    .then(async data => {
      let user = await data.json()
      return user;
    })
}

function getGroups() {
  return fetch("/getGroups", {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ token: localStorage.getItem("token") })
  })
    .then(async data => {
      let groups = Object.values(await data.json())
      return groups;
    })
}

function sendInvitation(groupName, userId) {
  fetch("/invite", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: localStorage.getItem("token"),
      userId: userId,
      group: groupName,
      inviter: JSON.parse(localStorage.getItem("fulldata")).username
    })
  }).then(data => data.text()).then(data => {
    alert(data);
    document.getElementById('courses').dispatchEvent(new Event('change'))
  }).catch(error => {
    console.log(error);
    alert('Failed to send invite');
  });
}

function setCourseGroupInvites() {
  document.getElementById("inviters").innerHTML = ''
  fetch("/getUser", {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ token: localStorage.getItem("token") })
  })
    .then(async res => {
      if (res.ok) {
        let user = await res.json()
        if (user.invites) {
          let invites = Object.values(user.invites)
          invites.forEach(invitation => {
            document.getElementById("inviters").innerHTML += `<tr class="group-leader group-member">
              <td>${invitation.inviter}</td>
              <td>${invitation.group}</td>
              <td> 
              <div class="actions">
                <button class="accept-btn" onclick="acceptOrdeclineInvitation(true,'${invitation.inviter}','${invitation.group}','${user.id}')">Accept</button>
                <button class="decline-btn" onclick="acceptOrdeclineInvitation(false,'${invitation.inviter}','${invitation.group}','${user.id}')">Reject</button>
                </div>
              </td>
            </tr>`
          })
        }
      }
    })
}

function acceptOrdeclineInvitation(accept, inviter, group, userId) {
  const body = { inviter: inviter, group: group, userId: userId }

  fetch((accept ? "/acceptInvitation" : "declineInvitation"), {
    method: "post", headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify(body)
  })
    .then(async data => {
      if (data.ok) {
        let res = await data.text()
        alert(res);
        setCourseGroupInvites()
        document.getElementById('courses').dispatchEvent(new Event('change'))
      }

    }).catch(err => {
      console.log(err);
      alert(`Failed to ${accept ? "accept" : "decline"} invitiation`);
    })

}

document.getElementById('courses').addEventListener('change', function () {
  let courseName = this.value
  document.getElementById("my-group").innerHTML = ''
  document.getElementById("members").innerHTML = ''
  document.getElementById('create-group-button').style.display = 'block';
  setMyGroup(courseName)
})



document.getElementById('create-group-button').addEventListener('click', async function () {
  const courseName = document.getElementById('courses').value
  if (courseName == 'none') return alert('You should select course first')
  const user = await getUser();
  const groups = await getGroups()
  let isInGroup = false;
  if (user.groups && Object.values(user.groups).length > 0) {
    let group = Object.values(user.groups).find(e => e.courseName.toLowerCase() == courseName.toLowerCase())
    isInGroup = group ? true : false
    if (isInGroup) {
      alert('Your are already in a group');
      return;
    }
  }

  await fetch("/create_group", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: localStorage.getItem("token"),
      name: `group${groups.length + 1}`,
      maxusers: 12,
      userInfo: user,
      courseName: courseName
    })
  }).catch(_ => {
    alert('Failed to create group');
    return;
  });

  alert('Group created successfully');
  window.location.reload();
});

document.addEventListener('DOMContentLoaded', function () {
  setCourseGroupInvites()
  const membersBody = document.getElementById('members');
  const codingButton = document.getElementById('coding');
  const designButton = document.getElementById('design');
  const analysisButton = document.getElementById('analysis');
  const searchBox = document.querySelector('input[placeholder="Search"]');

  function sortRowsByColumn(columnIndex) {
    // Convert the collection of rows to an array for sorting
    let rowsArray = Array.from(membersBody.rows);

    // Sort the array of rows based on the column index provided
    rowsArray.sort(function (rowA, rowB) {
      // Parse the text content of the specified cell as an integer for row A and B
      const gradeOfRowA = parseInt(rowA.cells[columnIndex].textContent, 10);
      const gradeOfRowB = parseInt(rowB.cells[columnIndex].textContent, 10);

      // If the grade of row A is less than the grade of row B, row B should come first
      if (gradeOfRowA < gradeOfRowB) {
        return 1;
      }
      // If the grade of row A is greater than the grade of row B, row A should come first
      if (gradeOfRowA > gradeOfRowB) {
        return -1;
      }
      // If the grades are equal, do not change the order
      return 0;
    });

    // Clear the current rows from the table body
    membersBody.innerHTML = '';

    // Append the sorted rows back to the table body
    rowsArray.forEach(function (row) {
      membersBody.appendChild(row);
    });
  }

  function filterRowsByName() {
    const searchTerm = searchBox.value.toLowerCase();
    let rowsArray = Array.from(membersBody.rows);
    let filteredRows = rowsArray.filter(row => row.cells[0].textContent.toLowerCase().includes(searchTerm));
    membersBody.innerHTML = ''; // Clear existing rows
    filteredRows.forEach(row => membersBody.appendChild(row)); // Append filtered rows
    rowsArray.filter(row => !filteredRows.includes(row)).forEach(row => membersBody.appendChild(row)); // Append non-filtered rows
  }

  codingButton.addEventListener('click', function () { sortRowsByColumn(3); });
  designButton.addEventListener('click', function () { sortRowsByColumn(4); });
  analysisButton.addEventListener('click', function () { sortRowsByColumn(5); });
  searchBox.addEventListener('keyup', filterRowsByName);
});
