import { Ok, Err } from '../result.js';
import { getAll, findById, create, updateById, removeById } from '../repositories/entriesRepository.js';
import { toEntryDto } from '../dtos/entryDto.js';
import { toAdminEntryDto } from '../dtos/adminEntryDto.js';
import * as usersRepository from '../repositories/usersRepository.js';

const validateEntry = ({ title, body }) => {
  const trimmedTitle = (title || '').trim();
  const trimmedBody = (body || '').trim();
  if (!trimmedTitle || !trimmedBody) return Err({ status: 400, message: 'title and body are required' });
  return Ok({ title: trimmedTitle, body: trimmedBody });
};

const isOwnerOrAdmin = async (entry, actorId) => {
  if (entry.ownerId.toString() === actorId) return true;
  const account = await usersRepository.findById(actorId);
  return account?.role === 'admin';
};

export const listEntries = async () =>
  (await getAll()).map(toEntryDto).sort((a, b) => a.title.localeCompare(b.title));

export const createEntry = async (data, actor) => {
  const result = validateEntry(data);
  if (!result.ok) return result;
  return Ok(toEntryDto(await create({ ...result.value, ownerId: actor.id })));
};

export const updateEntry = async (id, data, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: 'Entry not found' });
  if (!(await isOwnerOrAdmin(existing, actor.id))) {
    return Err({ status: 403, message: 'You do not have permission to modify this entry' });
  }

  const result = validateEntry(data);
  if (!result.ok) return result;
  return Ok(toEntryDto(await updateById(id, result.value)));
};

export const deleteEntry = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: 'Entry not found' });
  if (!(await isOwnerOrAdmin(existing, actor.id))) {
    return Err({ status: 403, message: 'You do not have permission to delete this entry' });
  }
  await removeById(id);
  return Ok(null);
};

export const toggleFavorite = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) {
    return Err({ status: 404, message: 'Entry not found'});
  }

  if(!(await isOwnerOrAdmin(existing, actor.id))) {
    return Err({
      status: 403,
      message: 'You do not have permission to modify this entry',
    });
  }

  return Ok(
    toEntryDto(
      await updateById(id, {
        favorite: !existing.favorite,
      }),
    ),
  );

};

export const listAdminEntries = async () => {
  return (await getAll()).map(toAdminEntryDto);
};