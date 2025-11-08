const { nanoid } = require('nanoid');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const CommentLikeRepository = require('../../Domains/comment_likes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    await this._pool.query(query);
  }

  async deleteLike(commentId, userId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('gagal menghapus like komentar');
    }
  }

  async isUserLikedComment(commentId, userId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) as like_count FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return parseInt(result.rows[0].like_count, 10);
  }

  async getLikeCountsByCommentIds(commentIds) {
    if (commentIds.length === 0) {
      return {};
    }

    const placeholders = commentIds.map((_, index) => `$${index + 1}`).join(', ');
    const query = {
      text: `SELECT comment_id, COUNT(*) as like_count FROM comment_likes WHERE comment_id IN (${placeholders}) GROUP BY comment_id`,
      values: commentIds,
    };

    const result = await this._pool.query(query);

    // Create a map with all commentIds initialized to 0
    const likeCounts = {};
    commentIds.forEach((commentId) => {
      likeCounts[commentId] = 0;
    });

    // Update with actual counts
    result.rows.forEach((row) => {
      likeCounts[row.comment_id] = parseInt(row.like_count, 10);
    });

    return likeCounts;
  }
}

module.exports = CommentLikeRepositoryPostgres;