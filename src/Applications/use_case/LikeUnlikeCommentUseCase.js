const NewCommentLike = require('../../Domains/comment_likes/entities/NewCommentLike');

class LikeUnlikeCommentUseCase {
  constructor({
    commentRepository,
    commentLikeRepository,
    threadRepository,
  }) {
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    // Verify thread exists
    await this._threadRepository.getThreadById(threadId);

    // Verify comment exists
    await this._commentRepository.getCommentById(commentId);

    // Check if user already liked the comment
    const isLiked = await this._commentLikeRepository.isUserLikedComment(commentId, userId);

    if (isLiked) {
      // Unlike the comment
      await this._commentLikeRepository.deleteLike(commentId, userId);
    } else {
      // Like the comment
      const newCommentLike = new NewCommentLike({ commentId, userId });
      await this._commentLikeRepository.addLike(newCommentLike.commentId, newCommentLike.userId);
    }
  }
}

module.exports = LikeUnlikeCommentUseCase;