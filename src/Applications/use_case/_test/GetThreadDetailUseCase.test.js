const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const expectedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };
    const expectedComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-124',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'sebuah comment',
        is_delete: true,
      },
    ];
    const expectedReplies = [
      {
        id: 'reply-123',
        content: 'sebuah reply',
        date: '2021-08-08T07:59:48.766Z',
        username: 'johndoe',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-124',
        content: 'sebuah reply',
        date: '2021-08-08T08:07:01.522Z',
        username: 'dicoding',
        comment_id: 'comment-123',
        is_delete: true,
      },
    ];
    const expectedLikeCounts = {
      'comment-123': 2,
      'comment-124': 0,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));
    mockCommentLikeRepository.getLikeCountsByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedLikeCounts));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123', 'comment-124']);
    expect(mockCommentLikeRepository.getLikeCountsByCommentIds).toBeCalledWith(['comment-123', 'comment-124']);
    expect(threadDetail).toEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          likeCount: 2,
          replies: [
            {
              id: 'reply-123',
              content: 'sebuah reply',
              date: '2021-08-08T07:59:48.766Z',
              username: 'johndoe',
            },
            {
              id: 'reply-124',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T08:07:01.522Z',
              username: 'dicoding',
            },
          ],
        },
        {
          id: 'comment-124',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        },
      ],
    });
  });
});
