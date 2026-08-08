import * as usersRepository from '../repositories/usersRepository.js';

export const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'You must be logged in to do that.'});
        return;
    }

    const account = await usersRepository.findById(req.user.id);

    if (account?.role !== 'admin') {
        res.status(403).json({ error: 'You must be an admin to do that.'});
        return;
    }

    next();
};