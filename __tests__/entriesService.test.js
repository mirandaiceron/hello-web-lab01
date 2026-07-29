import { jest, test } from '@jest/globals';

const mockRepository = {
  isValidId: jest.fn(() => true),
  getAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn((data) => ({ _id: 'fake-id', ...data })),
  updateById: jest.fn(),
  removeById: jest.fn(),
};

jest.unstable_mockModule('../repositories/entriesRepository.js', () => mockRepository);

const { createEntry, updateEntry, deleteEntry } = await import('../services/entriesService.js');

test('createEntry rejects a missing title', async () => {
  const result = await createEntry({ title: '', body: 'something' });
  expect(result.ok).toBe(false);
});

test('createEntry saves a valid entry and returns its DTO', async () => {
  const result = await createEntry({ title: 'Groceries', body: 'Milk, eggs' });
  expect(result.ok).toBe(true);
  expect(result.value).toEqual({ id: 'fake-id', title: 'Groceries', body: 'Milk, eggs' });
});

test('updateEntry return 404 when entry does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await updateEntry('fake-id', {
        title: 'Updated',
        body: 'Updated body'
});
    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
});

test('deleteEntry returns 404 when entry does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await deleteEntry('fake-id');

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
});

test('listEntries returns entries sorted alphabetically by title', async () => {
    mockRepository.getAll.mockResolvedValue([
        { _id: '2', title: 'Miranda', body: 'Third'},
        { _id: '1', title: 'Isabella', body: 'Second'},
        { _id: '3', title: 'Ceron', body: 'First'},
    ]);

    const { listEntries } = await import('../services/entriesService.js');

    const result = await listEntries();

    expect(result.map(entry => entry.title)).toEqual([
        'Ceron',
        'Isabella',
        'Miranda',
    ]);
});