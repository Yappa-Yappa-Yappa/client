import { useOutletContext } from "react-router-dom";
import UserPost from "../UserPost";

export default function ProfilePosts() {
  const { profile } = useOutletContext();

  return <UserPost userId={profile.id} />;
}
