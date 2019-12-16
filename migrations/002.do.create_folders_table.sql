CREATE TABLE folders (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  folder_name TEXT NOT NULL,
  _user INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
);