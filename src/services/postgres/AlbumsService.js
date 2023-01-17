const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year, coverUrl }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, name, year, coverUrl, createdAt, updatedAt],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT id, name, year, cover_url FROM albums WHERE id = $1',
      values: [id],
    };
    const querySong = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const album = await this._pool.query(queryAlbum);
    const song = await this._pool.query(querySong);

    if (!album.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return {
      id: album.rows[0].id,
      name: album.rows[0].name,
      year: album.rows[0].year,
      coverUrl: album.rows[0].cover_url,
      songs: song.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET name = $2, year = $3, updated_at = $4 WHERE id = $1',
      values: [id, name, year, updatedAt],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal diubah. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyAlbumById(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Album tidak ditemukan. Id tidak valid');
  }

  async updateAlbumCover(albumId, { path }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET cover_url = $2, updated_at = $3 WHERE id = $1',
      values: [albumId, path, updatedAt],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal mengunggah cover. Id tidak ditemukan');
    }
  }

  async checkAlbumLikes(albumId, credentialId) {
    const query = {
      text: 'SELECT album_id, user_id FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      await this.likeAlbum(albumId, credentialId);

      return 'Album disukai';
    }

    await this.unlikeAlbum(albumId, credentialId);

    return 'Batal menyukai album';
  }

  async likeAlbum(albumId, credentialId) {
    const id = `likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO album_likes VALUES($1, $2, $3)',
      values: [id, albumId, credentialId],
    };

    await this._pool.query(query);
    await this._cacheService.del(`album:${albumId}`);
  }

  async unlikeAlbum(albumId, credentialId) {
    const query = {
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, credentialId],
    };

    await this._pool.query(query);
    await this._cacheService.del(`album:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}`);

      const likes = JSON.parse(result);

      return {
        likes,
        cached: true,
      };
    } catch (err) {
      const query = {
        text: 'SELECT id FROM album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`album:${albumId}`, JSON.stringify(result.rowCount));

      return { likes: result.rowCount };
    }
  }
}

module.exports = AlbumsService;
