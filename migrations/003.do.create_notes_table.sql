CREATE TABLE notes (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  note_name text NOT NULL,
  content text,
  folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE NOT NULL
);