import { useOutletContext, useParams } from "react-router-dom";
import UserPost from "../UserPost";

export default function ProfilePosts() {
  const { profile } = useOutletContext();
  const { username } = useParams();

  return <UserPost userId={profile.id} profileUsername={username} />;
}
