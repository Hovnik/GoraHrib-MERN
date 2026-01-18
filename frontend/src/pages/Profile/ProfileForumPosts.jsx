import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ForumPagePost from "../Forum/ForumPagePost";

const ProfileForumPosts = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch all posts from friends
        const posts = await axios.get("http://localhost:3000/api/forum", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (token) {
          const decoded = jwtDecode(token);
          const currentUserId = decoded.id;
          setCurrentUserId(currentUserId);
        }

        setPosts(posts.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/forum/${postId}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments((prev) => ({
        ...prev,
        [postId]: response.data.comments,
      }));

      // Update comment count in posts
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, commentCount: response.data.comments.length }
            : post
        )
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/forum/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            const isLiked = post.likedBy.includes(currentUserId);
            return {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1,
              likedBy: isLiked
                ? post.likedBy.filter((id) => id !== currentUserId)
                : [...post.likedBy, currentUserId],
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const deletePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/forum/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.response?.data?.message || "Error deleting post");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "pravkar";
    if (diffHours < 24) return `pred ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "včeraj";
    if (diffDays === 2) return "pred 2 dnevoma";
    if (diffDays < 7) return `pred ${diffDays} dnevi`;
    return date.toLocaleDateString("sl-SI");
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6 flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  return (
    <>
      <div className="p-2 md:p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Moje objave</h1>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 italic py-8">
              Nimaš še nobenih objav.
            </p>
          ) : (
            posts.map((post) => (
              <ForumPagePost
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                comments={comments}
                onToggleLike={toggleLike}
                onDeletePost={deletePost}
                onFetchComments={fetchComments}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileForumPosts;
