const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, credentialId }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, credentialId, createdAt, updatedAt],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(credentialId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id LEFT JOIN users ON users.id = playlists.user_id WHERE playlists.user_id = $1 OR collaborations.user_id = $1',
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongIntoPlaylist(playlistId, songId) {
    const id = `list-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs_playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan kedalam playlist');
    }
  }

  async getSongsByPlaylistId(playlistId) {
    const queryPlaylist = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.user_id WHERE playlists.id = $1',
      values: [playlistId],
    };
    const querySong = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs LEFT JOIN songs_playlist ON songs_playlist.song_id = songs.id WHERE songs_playlist.playlist_id = $1',
      values: [playlistId],
    };

    const playlist = await this._pool.query(queryPlaylist);
    const songs = await this._pool.query(querySong);

    if (!playlist.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan. Id tidak valid');
    }

    return {
      id: playlist.rows[0].id,
      name: playlist.rows[0].name,
      username: playlist.rows[0].username,
      songs: songs.rows,
    };
  }

  async deleteSongFromPlaylistId(songId) {
    const query = {
      text: 'DELETE FROM songs_playlist WHERE song_id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(playlistId, credentialId) {
    const query = {
      text: 'SELECT id, user_id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.user_id !== credentialId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, credentialId) {
    try {
      await this.verifyPlaylistOwner(playlistId, credentialId);
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw err;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, credentialId);
      } catch {
        throw err;
      }
    }
  }
}

module.exports = PlaylistsService;
