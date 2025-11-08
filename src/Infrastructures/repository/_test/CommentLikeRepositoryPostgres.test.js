const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when CommentLikeRepositoryPostgres created', () => {
    it('should be instance of CommentLikeRepository domain', () => {
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres({}, {});

      expect(commentLikeRepositoryPostgres).toBeInstanceOf(CommentLikeRepository);
    });
  });

  describe('addLike function', () => {
    it('should persist add like and add like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, () => '123');

      // Action
      await commentLikeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      const commentLikes = await CommentLikesTableTestHelper.findLikeByCommentIdAndUserId('comment-123', 'user-123');
      expect(commentLikes).toHaveLength(1);
    });
  });

  describe('deleteLike function', () => {
    it('should throw InvariantError when like not found', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentLikeRepositoryPostgres.deleteLike('comment-123', 'user-123'))
        .rejects.toThrow(InvariantError);
    });

    it('should delete like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      await commentLikeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const commentLikes = await CommentLikesTableTestHelper.findLikeByCommentIdAndUserId('comment-123', 'user-123');
      expect(commentLikes).toHaveLength(0);
    });
  });

  describe('isUserLikedComment function', () => {
    it('should return false when user not liked comment', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.isUserLikedComment('comment-123', 'user-123');

      // Assert
      expect(result).toEqual(false);
    });

    it('should return true when user liked comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.isUserLikedComment('comment-123', 'user-123');

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return 0 when no likes found', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(result).toEqual(0);
    });

    it('should return correct like count', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-124', commentId: 'comment-123', userId: 'user-124' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(result).toEqual(2);
    });
  });

  describe('getLikeCountsByCommentIds function', () => {
    it('should return empty object when commentIds is empty', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.getLikeCountsByCommentIds([]);

      // Assert
      expect(result).toEqual({});
    });

    it('should return like counts correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', threadId: 'thread-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-124', commentId: 'comment-123', userId: 'user-124' });
      // comment-124 has no likes

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const result = await commentLikeRepositoryPostgres.getLikeCountsByCommentIds(['comment-123', 'comment-124']);

      // Assert
      expect(result).toEqual({
        'comment-123': 2,
        'comment-124': 0,
      });
    });
  });
});