const express = require('express');
const { Pool } = require('pg');
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

app.set("view engine", "html");
app.use(express.static(__dirname));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const pool = new Pool({
    user: 'duxqnqoj',
    host: 'rain.db.elephantsql.com',
    database: 'duxqnqoj',
    password: 'hhiJQXdCqYthVvZwNRjDSrJVqIOThm8J',
    port: 5432
})

app.use(cookieParser("COOKIE_SECRET"));

app.get('/', async (req, res) => {
    res.render("index");
})

app.get("/createTables", async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS jokes (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS votes (
                id SERIAL PRIMARY KEY,
                joke_id INT REFERENCES jokes(id),
                vote_type INT CHECK (vote_type IN (0, 1)),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        res.send('Create tables successfully');
    } catch (error) {
        res.send('Create tables error: ', error)
    }
});

app.post('/insert_joke', async (req, res) => {
    try {
        const jokeContent = req.query.content;
        const insertSql = 'INSERT INTO jokes (content) VALUES ($1) RETURNING id';
        const { rows } = await pool.query(insertSql, [jokeContent]);
        res.json({ id: rows[0].id });
    } catch (error) {
        console.log('Error inserting joke: ', error);
        res.status(500).send('Error inserting joke into the database');
    }
})

app.post('/insert_vote', async (req, res) => {
    try {
        const { joke_id, vote_type } = req.body;
        const insertSql = 'INSERT INTO votes (joke_id, vote_type) VALUES ($1, $2)';
        await pool.query(insertSql, [joke_id, vote_type]);
        res.send('Insert vote successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error inserting vote into the database');
    }
});

app.get('/get_joke', async (req, res) => {
    // const sql = 'SELECT * FROM jokes ORDER BY RAND() LIMIT 1';
    try {
        const seenJokes = req.cookies['seen_jokes'] ? JSON.parse(req.cookies['seen_jokes']) : [];
        const result = await pool.query('SELECT id, content FROM jokes WHERE id NOT IN (SELECT UNNEST($1::int[])) ORDER BY RANDOM() LIMIT 1', [seenJokes]);
        
        if (result.rows.length === 0) {
            res.status(404).send('No more jokes available');
            return;
        }

        const joke = result.rows[0];
        seenJokes.push(joke.id);
        res.cookie('seen_jokes', JSON.stringify(seenJokes));
        res.json(joke);
    } catch (error) {
        console.error('Error getting joke: ', error);
        res.status(500).send('Error getting joke');
    }
});

app.listen(port, () => {
    console.log('Server running on port: ', port);
});