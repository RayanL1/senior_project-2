const express = require("express");
const app = express();
const multer = require('multer');
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = require("./senior-project-624e4-firebase-adminsdk-3fsj4-9dd65c0637.json")
const jwt = require('jsonwebtoken');
const secretKey = 'testingapp2024';
const PORT = process.env.PORT || 3000;
const frontDirPath = path.join(__dirname, '../front');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    file.originalname = uniqueSuffix + '-' + file.originalname
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://senior-project-624e4-default-rtdb.firebaseio.com",
  storageBucket: "gs://senior-project-624e4.appspot.com"
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });

const bucket = admin.storage().bucket();
const users = admin.database().ref("users")
const groups = admin.database().ref("groups")

app.get('/', (req, res) => {
  res.sendFile(frontDirPath + `/pages/user/landing.html`);
})
app.get("/:filename", (req, res) => {
  const { filename } = req.params
  res.sendFile(frontDirPath + `/pages/user/${filename}.html`);
});
app.get("/admin/:filename", (req, res) => {
  const { filename } = req.params
  res.sendFile(frontDirPath + `/pages/admin/${filename}.html`);
});
app.get("/front/styles/css/:filename", (req, res) => {
  const { filename } = req.params
  res.sendFile(frontDirPath + `/styles/css/${filename}`);
});
app.get("/front/styles/images/:filename", (req, res) => {
  const { filename } = req.params
  res.sendFile(frontDirPath + `/styles/images/${filename}`);
});
app.get("/scripts/:filename", (req, res) => {
  const { filename } = req.params
  res.sendFile(frontDirPath + `/scripts/${filename}`);
});

app.post("/signup", (req, res) => {
  users.get().then(data => {
    let userFound = false
    const userValues = data.val() ? Object.values(data.val()) : []
    if (userValues.length > 0) {
      userFound = userValues.find(user => user.email === req.body.email || user.username === req.body.username);
    }
    if (userFound) {
      res.status(401).json({ error: "User already exists" });
    } else {
      const body = req.body;
      body.uId = body.email.split('@')[0]
      users.push(body).then(data => {
        res.status(200).json(data);
      })
    }
  });
})
app.post("/login", (req, res) => {

  users.get().then(data => {
    const userValues = Object.entries(data.val())

    const userFound = userValues.find(user =>
      (user[1].email === req.body.email && user[1].password === req.body.password) ||
      (user[1].username === req.body.username && user[1].password === req.body.password)
    );

    if (userFound) {
      const token = jwt.sign(userFound[1], secretKey, { expiresIn: '30d' });
      const isAdmin = userFound[1].email === 'admin@admin.com';
      res.status(200).json({ user: { id: userFound[0], ...userFound[1] }, token: token, isAdmin: isAdmin });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});
app.post("/getUser", (req, res) => {
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, secretKey);
    const email = decoded.email;
    users.get().then(data => {

      const userEntries = Object.entries(data.val())
      const userFoundEntry = userEntries.find(user => user[1].email === email)
      if (userFoundEntry) return res.status(200).json({ ...userFoundEntry[1], id: userFoundEntry[0] })
    });
  } catch (error) {
    return res.status(401).send("Invalid credentials");
  }
})
app.post("/getUsers", (req, res) => {
  let ulist = []
  users.get().then(async data => {
    data = await data.val()
    for (let key in data) {
      if (data[key].email != 'admin@admin.com') {
        if (req.body.savedClass && req.body.category) {
          if (data[key].class.toLowerCase() == req.body.savedClass.toLowerCase() && data[key].major.toLowerCase() == req.body.category.toLowerCase()) {
            ulist.push({ uId: data[key].uId, name: data[key].username, id: key, coursesAssesment: data[key].coursesAssesment })
          }
        } else {
          ulist.push({ ...data[key], id: key ,name: data[key].username})

        }
      }

    }
    res.status(200).json(ulist)
  })
})
app.post("/send-data", (req, res) => {
  let results = req.body;
  for (let index = 0; index < results.length; index++) {
    const data = results[index];
    admin.database().ref(`users/${data.studentId}/skills`).set({
      coding: data.coding,
      analysis: data.analysis,
      design: data.design
    })
  }
  res.status(200).json(results);
})

app.post("/send-course-assessment", async (req, res) => {
  try {
    let results = req.body.results;
    let studentId = req.body.studentId;
    admin.database().ref(`users/${studentId}/coursesAssesment`).set(results)
      .then(_ => {
        res.status(200).send("Saved Successfully");
      })
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Something went wrong .." });
  }
})
app.post("/personal", upload.single('file'), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file
    const decoded = jwt.verify(body.token, secretKey);
    let avatar = '';
    if (file) {
      const dest = "uploads/" + file.originalname
      await bucket.upload(file.path, { destination: dest, public: true })
      avatar = `https://firebasestorage.googleapis.com/v0/b/senior-project-624e4.appspot.com/o/${encodeURIComponent(dest)}?alt=media`
    }
    users.get().then(async data => {
      const userValues = data.val()
      for (let key in userValues) {
        if (userValues[key].email === decoded.email) {
          userValues[key].username = body.name
          userValues[key].about = body.about
          userValues[key].major = body.major
          userValues[key].email = body.email
          if (avatar != '') userValues[key].avatar = avatar
          await admin.database().ref(`users/${key}`).set(userValues[key])
          let token = jwt.sign(userValues[key], secretKey, { expiresIn: '30d' });
          return res.status(200).json({ user: userValues[key], token: token });
        }
      }
      return res.status(401).json({ error: "Invalid user email .." });
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Something went wrong .." });
  }
})
app.post("/project", upload.single('file'), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file
    const decoded = jwt.verify(body.token, secretKey);
    const dest = "uploads/" + file.originalname
    bucket.upload(file.path, {
      destination: dest, public: true
    }).then((_) => {
      const url = `https://firebasestorage.googleapis.com/v0/b/senior-project-624e4.appspot.com/o/${encodeURIComponent(dest)}?alt=media`;
      users.get().then(data => {
        const userValues = data.val()
        for (let key in userValues) {
          if (userValues[key].email === decoded.email) {
            const projectBody = { name: body.name, desc: body.desc, url: url }
            admin.database().ref(`users/${key}/projects`).push(projectBody)
            return res.status(200).send("Project Added Successfully");
          }
        }
      })
    })
  } catch (error) {
    return res.status(401).json({ error: "Something went wrong .." });
  }
})
app.post("/save_languages", (req, res) => {
  try {
    const body = req.body.languages;
    const decoded = jwt.verify(req.body.token, secretKey);

    users.get().then(data => {
      const userValues = data.val()
      for (let key in userValues) {
        if (userValues[key].email === decoded.email) {
          admin.database().ref(`users/${key}/languages`).set(body)
          userValues[key].languages = body
          return res.status(200).json({ user: userValues[key] });
        }
      }
      return res.status(401).json({ error: "Something went wrong .." });
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Something went wrong .." });
  }
})
app.post("/certificates", upload.single('file'), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file
    const decoded = jwt.verify(body.token, secretKey);
    const dest = "uploads/" + file.originalname
    bucket.upload(file.path, {
      destination: dest, public: true
    }).then((_) => {
      const url = `https://firebasestorage.googleapis.com/v0/b/senior-project-624e4.appspot.com/o/${encodeURIComponent(dest)}?alt=media`;
      users.get().then(data => {
        const userValues = data.val()
        for (let key in userValues) {
          if (userValues[key].email === decoded.email) {
            const certificateBody = { name: body.name, desc: body.desc, url: url }
            admin.database().ref(`users/${key}/certificates`).push(certificateBody)
            return res.status(200).send("Certificate Added Successfully");
          }
        }
      })
    })
  } catch (error) {
    return res.status(401).json({ error: "Something went wrong .." });
  }
})
app.post("/getGroup", async (req, res) => {
  let groupId = req.body.id;
  groups.get().then(async data => {
    let groups = Object.entries(await data.val());
    let group = groups.find(group => group[0] == groupId)
    if (group) {
      for (const key in group[1].members) {
        const member = group[1].members[key]
        const userId = member.id;
        let res = await admin.database().ref(`users/${userId}`).get()
        let user = await res.val()
        group[1].members[key].user = user
      }
      return res.status(200).json(group[1])
    }
    else
      return res.status(404).json({ error: "No Group Founded ..." })
  })
})
app.post("/getGroups", async (req, res) => {
  groups.get().then(async data => {
    let groups = Object.entries((await data.val()) ?? []);
    return res.status(200).json(groups)
  })
})
app.post("/create_group", async (req, res) => {
  try {
    const usersSnapshot = await users.get();
    const usersValues = usersSnapshot.val();

    if (!usersValues) {
      return res.status(404).json({ error: "No Users Included" });
    }
    const body = req.body;
    const userInfo = body.userInfo;
    const courseName = body.courseName;

    if (!userInfo || !courseName) {
      return res.status(401).json({ error: "User not found or user data incomplete" });
    }

    const newGroup = {
      name: req.body.name,
      maxusers: req.body.maxusers,
      members: [],
    };

    const newMember = {
      name: userInfo.username,
      id: userInfo.id,
      major: userInfo.major,
      skills: { analysis: 0, coding: 0, design: 0 },
    }

    const newGroupRef = await admin.database().ref("groups").push(newGroup);
    await admin.database().ref(`groups/${newGroupRef.key}/members`).push(newMember)

    await admin
      .database()
      .ref(`users/${userInfo.id}/groups`)
      .push({ name: req.body.name, key: newGroupRef.key, courseName: courseName });

    return res.status(200).send("Add Successfully");
  }
  catch (error) {
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});
app.post("/invite", (req, res) => {
  const body = req.body;
  admin.database().ref(`users/${body.userId}/invites`).get().then(async data => {
    data = await data.val();
    if (data) {
      for (let key in data) {
        if (data[key].group == body.group) {
          res.send("Already Sent");
          return;
        }
      }
    }

    admin.database().ref(`users/${body.userId}/invites`).push({ group: body.group, inviter: body.inviter });
    res.send("Invite has been sent successfully");
  });
});
app.post("/acceptInvitation", (req, res) => {
  try {
    const body = req.body;
    const userId = body.userId;
    admin.database().ref(`users/${userId}`).get().then(async users => {
      const user = await users.val()
      const invites = Object.entries(user.invites ?? []);
      let index = invites.findIndex(e => e[1].group == body.group && e[1].inviter == body.inviter)
      if (index != -1) {
        invites.splice(index, 1)
        admin.database().ref(`users/${userId}/invites`).set(invites);
      }

      admin.database().ref("groups").get().then(async groups => {
        const groupsEntries = Object.entries(await groups.val())

        let group = groupsEntries.find(e => e[1].name.toLowerCase() == body.group.toLowerCase())
        const newMember = {
          name: user.username,
          id: userId,
          major: user.major,
          skills: [0, 0, 0],
        };
        admin.database().ref(`groups/${group[0]}/members`).push(newMember).then(_ => {
          return res.status(200).send("Accepted Successfully");
        })
      })
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});
app.post("/declineInvitation", (req, res) => {
  try {
    const body = req.body;
    const userId = body.userId;
    admin.database().ref(`users/${userId}`).get().then(async users => {
      const user = await users.val()
      const invites = Object.entries(user.invites);
      let index = invites.findIndex(e => e[1].group == body.group && e[1].inviter == body.inviter)
      if (index != -1) {
        invites.splice(index, 1)
        admin.database().ref(`users/${userId}/invites`).set(invites);
      }
      return res.status(200).send("Declined Successfully");
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.post("/deleteProject", (req, res) => {
  try {
    const body = req.body;
    const userId = body.userId;
    const projectId = body.id;
    admin.database().ref(`users/${userId}`).get().then(async users => {
      const user = await users.val()
      const projects = Object.entries(user.projects);
      let index = projects.findIndex(e => e[0] == projectId)
      if (index != -1) {
        projects.splice(index, 1)
        admin.database().ref(`users/${userId}/projects`).set(projects);
      }
      return res.status(200).send("Deleted Successfully");
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.post("/deleteCertificate", (req, res) => {
  try {
    const body = req.body;
    const userId = body.userId;
    const certificateId = body.id;
    admin.database().ref(`users/${userId}`).get().then(async users => {
      const user = await users.val()
      const certificates = Object.entries(user.certificates);
      let index = certificates.findIndex(e => e[0] == certificateId)
      if (index != -1) {
        certificates.splice(index, 1)
        admin.database().ref(`users/${userId}/certificates`).set(certificates);
      }
      return res.status(200).send("Deleted Successfully");
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});



