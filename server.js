const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');


const app = express();
app.use(bodyParser.json());
app.use(cors()); 


const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, phone TEXT)');
});


app.get('/users', (req, res) => {
  db.all('SELECT id, name FROM users', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});


app.post('/users', (req, res) => {
  const { name, email, phone } = req.body;
  db.run('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json({ id: this.lastID });
    }
  });
});


app.get('/users/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(row);
    }
  });
});


app.put('/users/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const { name, email, phone } = req.body;
  db.run('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, userId], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'User updated successfully' });
    }
  });
});


app.delete('/users/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  });
});


app.listen(3001, () => {
  console.log('Server started on port 3001');
});
