import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';

const router = Router();


router.get('/', (req, res) => {
    res.status(200).send('Home page');
});

router.get('/about', (req, res) => {
    res.status(200).send('About page');
});

router.get('/entries', async(req, res) => {

    const data = await readFile('entries.json', 'utf-8'); //reads entire file as text
    const entries = JSON.parse(data); //turns text into JavaScript array 
    
    res.set('Cache-Control', 'public, max-age=60');
    res.set('X-Total-Count', entries.length);

    res.status(200).render('entries', {
        title: 'My Notes',
        entries
    });
});

router.get('/entries/:id', async(req, res) => {
    
    const data = await readFile('entries.json', 'utf-8'); //reads entire file as text
    const entries = JSON.parse(data); //turns text into JavaScript array 
    
    const id = Number(req.params.id);

    if (id < 0 || id >= entries.length) {
        return res.status(404).render('error');
    }

    res.status(200).render('entry', {
        entry: entries[id]
    });
});

router.post('/entries', async(req, res) => {

    const data = await readFile('entries.json', 'utf-8'); //reads entire file as text
    const entries = JSON.parse(data); //turns text into JavaScript array 

    const { title, body } = req.body;

    if (!title || !body) {
        return res.status(400).json({
            error: 'title and body are required'
        });
    }

    const newEntry = {
        title,
        body
    };

    entries.push(newEntry);

    await writeFile(
        'entries.json',
        JSON.stringify(entries, null, 2)
    );

    res.status(201).json(newEntry);

});

router.delete('/entries/:id', async(req, res) => {

    const data = await readFile('entries.json', 'utf-8'); //reads entire file as text
    const entries = JSON.parse(data); //turns text into JavaScript array 

    const id = Number(req.params.id);

    if (id < 0 || id >= entries.length) {
        return res.status(404).json({
            error: 'Entry not found'
        });
    }

    entries.splice(id, 1);

    await writeFile(
        'entries.json',
        JSON.stringify(entries, null, 2)
    );

    res.status(204).send();

});

router.get('/random-post', async (req, res) => { //creates a new route, when someone visits /random-post this function runs
  const response = await fetch('https://jsonplaceholder.typicode.com/posts/1'); //sends a request to another server
  const post = await response.json();
  res.status(200).json(post);
});

router.get('/three-posts', async (req, res) => {
  const ids = [1, 2, 3];
  const titles = [];
  for (const id of ids) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const post = await response.json();
    titles.push(post.title);
  }
  res.status(200).json({ titles });
});

export default router;