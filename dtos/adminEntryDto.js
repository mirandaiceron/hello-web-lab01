export const toAdminEntryDto = (entry) => ({
    id: entry._id.toString(),
    title: entry.title,
    body: entry.body,
    favorite: entry.favorite,
    ownerId: entry.ownerId.toString(),
});