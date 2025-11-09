const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// -------- helper โหลด/เซฟ users ----------
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const raw = fs.readFileSync(USERS_FILE, 'utf8') || '[]';
  return JSON.parse(raw);
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// -------- middleware พื้นฐาน ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'CHANGE_THIS_SECRET_KEY',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 ชั่วโมง
  })
);

// -------- API สมัครสมาชิก ----------
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ ok: false, message: 'กรุณากรอกข้อมูลให้ครบ' });

  const users = loadUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ ok: false, message: 'มี username นี้แล้ว' });
  }

  const hash = await bcrypt.hash(password, 10);

  users.push({
    username,
    passwordHash: hash,
    createdAt: new Date().toISOString()
  });

  saveUsers(users);

  return res.json({ ok: true, message: 'สมัครสมาชิกสำเร็จ ลองล็อกอินได้เลย' });
});

// -------- API ล็อกอิน ----------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ ok: false, message: 'username หรือ password ไม่ถูกต้อง' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(400).json({ ok: false, message: 'username หรือ password ไม่ถูกต้อง' });
  }

  // เก็บข้อมูลใน session
  req.session.user = { username: user.username };
  return res.json({ ok: true, message: 'ล็อกอินสำเร็จ' });
});

// -------- API เช็คว่าใครล็อกอินอยู่ ----------
app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ ok: false });
  }
  return res.json({ ok: true, user: req.session.user });
});

// -------- API logout ----------
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, message: 'ออกจากระบบแล้ว' });
  });
});

// -------- ป้องกันหน้า dashboard ----------
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
