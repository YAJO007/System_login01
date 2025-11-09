async function login() {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const msg = document.getElementById('msg');

      msg.textContent = '';

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      msg.textContent = data.message || '';

      if (data.ok) {
        msg.style.color = '#22c55e';
        setTimeout(() => { window.location.href = '/dashboard'; }, 500);
      } else {
        msg.style.color = '#f97316';
      }
    }