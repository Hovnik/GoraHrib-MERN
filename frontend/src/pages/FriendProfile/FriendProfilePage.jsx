import { useParams } from "react-router";
import FriendProfileCard from "./FriendProfileCard.jsx";
import FriendProfileForumPosts from "./FriendProfileForumPosts.jsx";

const FriendProfilePage = () => {
  const { userId } = useParams();

  return (
    <div>
      <FriendProfileCard userId={userId} />
      <FriendProfileForumPosts userId={userId} />
    </div>
  );
};

export default FriendProfilePage;
