import { Router } from 'express';

const router = Router();

const entries = [
    {
        title: 'First note',
        body: 'Learning Express'
    },
    {
        title: 'Second note',
        body: 'Learning EJS'
    },
    {
        title: 'Third note',
        body: 'Learning Templates'
    }
];

router.get('/', (req, res) => {
    res.send('Home page');
});

router.get('/about', (req, res) => {
    res.send('About page');
});

router.get('/entries', (req, res) => {
    res.render('entries', {
        title: 'My Notes',
        entries
    });
});

router.get('/entries/:id', (req, res) => {
    const id = Number(req.params.id);

    if (id < 0 || id >= entries.length) {
        return res.status(404).render('error');
    }

    res.render('entry', {
        entry: entries[id]
    });
});

router.post('/entries', (req, res) => {

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

    res.status(201).json(newEntry);

});

router.delete('/entries/:id', (req, res) => {

    const id = Number(req.params.id);

    if (id < 0 || id >= entries.length) {
        return res.status(404).json({
            error: 'Entry not found'
        });
    }

    entries.splice(id, 1);

    res.status(204).send();

});

export default router;