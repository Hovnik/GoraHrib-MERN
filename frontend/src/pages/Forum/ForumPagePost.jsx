import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import api from "../../config/axios";
import DeletePostModal from "../../modals/forum-modals/delete-post-modal";
import DeleteCommentModal from "../../modals/forum-modals/delete-comment-modal";

const ForumPagePost = ({
  post,
  currentUserId,
  comments,
  onToggleLike,
  onDeletePost,
  onFetchComments,
  formatDate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] =
    useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);

  useEffect(() => {
    // Fetch comments when expanded
    if (isExpanded && !comments[post._id]) {
      onFetchComments(post._id);
    }
  }, [isExpanded, post._id, comments, onFetchComments]);

  const toggleComments = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      await api.post(
        `/api/forum/${post._id}/comments`,
        { content: newComment.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Refresh comments
      await onFetchComments(post._id);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(error.response?.data?.message || "Error adding comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(
        `/api/forum/${postId}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Refresh comments
      await onFetchComments(post._id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.response?.data?.message || "Error deleting comment");
    }
  };

  // Generate profile picture URL
  const getProfilePicture = () => {
    const pic = post.userId?.profilePicture?.url;
    if (pic) return pic;
    const username = post.userId.username || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username,
    )}&size=100&background=22c55e&color=fff`;
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        {/* Post Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-3 flex-1 items-center">
            {/* Profile Picture */}
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img src={getProfilePicture()} alt={post.userId.username} />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <p className="text-sm font-semibold">{post.userId.username}</p>
              <p className="text-xs text-gray-600">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          <span
            className={`badge ${
              post.category === "Hike" ? "badge-primary" : "badge-secondary"
            } badge-sm`}
          >
            {post.category === "Hike" ? "Pohod" : "Dosežek"}
          </span>
        </div>

        {/* Post Content */}
        {post.title && (
          <h2
            className={`text-lg font-bold ${post.achievementId ? "mb-2" : ""}`}
          >
            {post.title}
          </h2>
        )}

        {!post.achievementId && (
          <p className="text-gray-700 mb-4">{post.content}</p>
        )}
        {/* Achievement Badge */}
        {post.achievementId && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="text-6xl">{post.achievementId.badge}</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-yellow-800">
                {post.achievementId.title}
              </h3>
              <p className="text-sm text-gray-600">
                {post.achievementId.description}
              </p>
              <span
                className={`badge badge-sm mt-1 ${
                  post.achievementId.rarity === "Common"
                    ? "badge-neutral"
                    : post.achievementId.rarity === "Rare"
                      ? "badge-info"
                      : post.achievementId.rarity === "Epic"
                        ? "badge-secondary"
                        : "badge-warning"
                }`}
              >
                {post.achievementId.rarity}
              </span>
            </div>
          </div>
        )}

        {/* Pictures */}
        {post.pictures && post.pictures.length > 0 && (
          <div className="overflow-x-auto mb-4">
            <div className="flex gap-2 pb-2">
              {post.pictures.map((pic, idx) => (
                <img
                  key={idx}
                  src={pic}
                  alt={`Post image ${idx + 1}`}
                  className="rounded-lg h-64 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                  onClick={() => setEnlargedImage(pic)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-2 border-t">
          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => onToggleLike(post._id)}
                onMouseEnter={() => setShowLikeTooltip(true)}
                onMouseLeave={() => setShowLikeTooltip(false)}
                className={`btn btn-ghost btn-sm gap-2 ${
                  post.likedBy.includes(currentUserId) ? "text-red-500" : ""
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    post.likedBy.includes(currentUserId) ? "fill-current" : ""
                  }`}
                />
                {post.likes}
              </button>
              {showLikeTooltip &&
                post.likedByUsers &&
                post.likedByUsers.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 bg-base-300 text-sm rounded-lg shadow-lg p-2 z-10 min-w-max">
                    <p className="font-semibold mb-1">Všečkov:</p>
                    {post.likedByUsers.map((user, idx) => (
                      <p key={idx} className="text-xs">
                        {user.username}
                      </p>
                    ))}
                  </div>
                )}
            </div>
            <button
              onClick={toggleComments}
              className="btn btn-ghost btn-sm gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {post.commentCount}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Delete button for own posts (not achievement posts) */}
          {post.userId._id === currentUserId && !post.achievementId && (
            <div className="flex gap-2">
              <button
                // onClick={() => onDeletePost(post._id)}
                onClick={() => setIsDeleteModalOpen(true)}
                className="btn btn-error btn-sm btn-square"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t space-y-3">
            {comments[post._id] && comments[post._id].length > 0 ? (
              comments[post._id].map((comment) => (
                <div key={comment._id} className="bg-base-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        {comment.userId.username}
                      </p>
                      <p className="text-sm break-words whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                    {/* Delete button for own comments */}
                    {comment.userId._id === currentUserId && (
                      <button
                        onClick={() => {
                          setCommentToDelete(comment._id);
                          setIsDeleteCommentModalOpen(true);
                        }}
                        className="btn btn-ghost btn-xs btn-square text-error flex-shrink-0"
                        title="Izbriši komentar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-2">
                Ni komentarjev
              </p>
            )}

            {/* Add Comment */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Dodaj komentar..."
                className="input input-bordered input-sm flex-1"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newComment.trim() && !isSubmitting) {
                    handleSendComment();
                  }
                }}
                disabled={isSubmitting}
              />
              <button
                onClick={handleSendComment}
                className="btn btn-success btn-sm btn-square"
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDeletePost(post._id)}
        postTitle={post.title}
      />
      <DeleteCommentModal
        isOpen={isDeleteCommentModalOpen}
        onClose={() => {
          setIsDeleteCommentModalOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={() => {
          if (commentToDelete) {
            onDeleteComment(post._id, commentToDelete);
            setIsDeleteCommentModalOpen(false);
            setCommentToDelete(null);
          }
        }}
      />

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={enlargedImage}
              alt="Enlarged"
              className="max-w-full max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-4 right-4 btn btn-circle btn-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPagePost;
