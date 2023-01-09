const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const MapDBToModel = require('../../utils/playlists');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, createdAt, updatedAt],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists() {
    const result = await this._pool.query('SELECT id, name, user_id FROM playlists');

    return MapDBToModel(result.rows);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongIntoPlaylist(id, { songId }) {
    const query = {
      text: 'INSERT INTO playlists VALUES($2) WHERE id = $1',
      values: [id, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Lagu gagal ditambahkan. Id playlist tidak ditemukan');
    }
  }

  async deleteSongByPlayistId(id, { songId }) {
    const query = {
      text: 'DELETE FROM playlists WHERE ',
    };
  }
}

module.exports = PlaylistsService;
