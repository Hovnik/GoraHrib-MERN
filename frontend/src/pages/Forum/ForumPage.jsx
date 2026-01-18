import { useState, useEffect } from "react";
import axios from "axios";
import ForumPageTabs from "./ForumPageTabs";
import ForumPagePost from "./ForumPagePost";
import { jwtDecode } from "jwt-decode";

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch initial posts from friends
        const response = await axios.get(
          "http://localhost:3000/api/forum/friends?page=1&limit=10",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (token) {
          const decoded = jwtDecode(token);
          const currentUserId = decoded.id;
          setCurrentUserId(currentUserId);
        }

        setPosts(response.data.posts);
        setHasMore(response.data.hasMore);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const loadMorePosts = async () => {
    try {
      setLoadingMore(true);
      const token = localStorage.getItem("token");
      const nextPage = currentPage + 1;

      const response = await axios.get(
        `http://localhost:3000/api/forum/friends?page=${nextPage}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
      setHasMore(response.data.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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

  const filteredPosts = posts
    .filter(
      (post) => activeCategory === "All" || post.category === activeCategory
    )
    .filter((post) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.userId.username.toLowerCase().includes(query)
      );
    });

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
      <div className="p-2 pb-20 md:pb-2 flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Forum</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Išči objave po naslovu, vsebini ali uporabniku..."
          className="input input-bordered w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ForumPageTabs
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Posts List */}
      <div className="space-y-4 pb-20 md:pb-4">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-400 italic py-8">
            Ni objav v tej kategoriji
          </p>
        ) : (
          filteredPosts.map((post) => (
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

        {/* Load More Button */}
        {hasMore && filteredPosts.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMorePosts}
              disabled={loadingMore}
              className="btn btn-primary btn-wide"
            >
              {loadingMore ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Nalaganje...
                </>
              ) : (
                "Naloži več objav"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
