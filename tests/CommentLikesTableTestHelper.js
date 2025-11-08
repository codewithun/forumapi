/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addLike({
    id = 'like-123',
    commentId = 'comment-123',
    userId = 'user-123',
    date = '2021-08-08T07:19:09.775Z',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    await pool.query(query);
  },

  async addCommentLike({
    id = 'like-123',
    commentId = 'comment-123',
    userId = 'user-123',
    date = '2021-08-08T07:19:09.775Z',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    await pool.query(query);
  },

  async findLikeByCommentIdAndUserId(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentLikeById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;