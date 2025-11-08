const NewCommentLike = require('../../../Domains/comment_likes/entities/NewCommentLike');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeUnlikeCommentUseCase = require('../LikeUnlikeCommentUseCase');

describe('LikeUnlikeCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengorkestrasikan langkah menambah like dengan benar.
   */
  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.isUserLikedComment = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Create use case instance
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentById)
      .toHaveBeenCalledWith('comment-123');
    expect(mockCommentLikeRepository.isUserLikedComment)
      .toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentLikeRepository.addLike)
      .toHaveBeenCalledWith('comment-123', 'user-123');
  });

  /**
   * Menguji apakah use case mampu mengorkestrasikan langkah menghapus like dengan benar.
   */
  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.isUserLikedComment = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Create use case instance
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentById)
      .toHaveBeenCalledWith('comment-123');
    expect(mockCommentLikeRepository.isUserLikedComment)
      .toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentLikeRepository.deleteLike)
      .toHaveBeenCalledWith('comment-123', 'user-123');
  });
});