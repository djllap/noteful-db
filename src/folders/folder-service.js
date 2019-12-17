const folderService = {
  getAllFolders(knex) {
    return knex.select('*').from('folders');
  },

  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('folders')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('folders')
      .where('id', id)
      .first();
  },

  deleteFolder(knex, id) {
    return knex('folders')
      .where('id', id)
      .delete();
  },

  updateFolder(knex, id, newFolderFields) {
    return knex('folders')
      .where('id', id)
      .update(newFolderFields);
  },

  getNotesInFolder(knex, folderId) {
    return knex('notes')
      .select('*')
      .where('folder_id', folderId);
  }
};

module.exports = folderService;