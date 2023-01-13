const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const mapDBToModel = require('../../utils/activities');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity({
    action, playlistId, songId, credentialId,
  }) {
    const id = `log-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, action, playlistId, songId, credentialId, createdAt],
    };

    await this._pool.query(query);
  }

  async getActivitiesByPlaylistId(playlistId) {
    const query = {
      text: 'SELECT users.username, songs.title, activities.action, activities.created_at FROM activities LEFT JOIN users ON users.id = activities.user_id LEFT JOIN songs ON songs.id = activities.song_id WHERE activities.playlist_id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Aktifitas tidak ditemukan. Id playlist tidak valid');
    }

    return result.rows.map(mapDBToModel);
  }
}

module.exports = ActivitiesService;
