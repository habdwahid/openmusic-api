/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      references: '"playlists"',
      onDelete: 'CASCADE',
    },
    song_id: {
      type: 'VARCHAR(50)',
      references: '"songs"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'VARCHAR(50)',
      references: '"users"',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'TIMESTAMP',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('activities');
};
