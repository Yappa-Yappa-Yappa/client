import { ArrowLeft, LoaderCircle, Search, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "../api/follow";
import { useAuth } from "../hooks/useAuth";

export default function Friend() {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [followStates, setFollowStates] = useState({});
  const [followLoadingId, setFollowLoadingId] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const activeTab = location.pathname.endsWith("/followers")
    ? "followers"
    : "following";
  const isViewingOwnProfile = username === currentUser?.username;

  const loadUsers = useCallback(async () => {
    if (!username) return;

    setLoading(true);
    setError("");

    try {
      const response =
        activeTab === "followers"
          ? await getFollowers(username)
          : await getFollowing(username);
      const result = response.data || {};
      const items =
        activeTab === "followers" ? result.followers : result.followings;

      const nextUsers = (items || [])
        .map((item) => item.follower || item.following)
        .filter(Boolean);

      setUsers(nextUsers);
      setFollowStates(
        Object.fromEntries(
          nextUsers.map((user) => [
            user.id,
            Boolean(user.isFollowing),
          ]),
        ),
      );
      setCount(result.count || 0);
    } catch (requestError) {
      setUsers([]);
      setFollowStates({});
      setCount(0);
      setError(
        requestError.response?.data?.message || `Could not load ${activeTab}.`,
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, username]);

  useEffect(() => {
    const loadId = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(loadId);
  }, [loadUsers]);

  const changeTab = (tab) => {
    navigate(`/friend/${username}/${tab}`);
  };

  const handleFollowToggle = async (user) => {
    if (!user.id || user.id === currentUser?.id || followLoadingId) return;

    const isFollowing = Boolean(followStates[user.id]);
    setFollowLoadingId(user.id);
    setActionError("");

    try {
      if (isFollowing) await unfollowUser(user.id);
      else await followUser(user.id);

      setFollowStates((previous) => ({
        ...previous,
        [user.id]: !isFollowing,
      }));
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message || "Could not update follow status.",
      );
    } finally {
      setFollowLoadingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [user.name, user.username].some((value) =>
        value?.toLowerCase().includes(query),
      ),
    );
  }, [searchText, users]);

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex items-center gap-3 border-b border-black/10 px-5 py-4 dark:border-neutral-800">
          <Link
            to={`/profile/${username}`}
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-black/5 hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-neutral-200"
            aria-label="Back to profile"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-neutral-900 dark:text-neutral-100">
              @{username}
            </h1>
            <p className="text-xs text-neutral-500">
              {activeTab === "followers" ? "Followers" : "Following"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchOpen((open) => !open);
              if (searchOpen) setSearchText("");
            }}
            className="ml-auto rounded-lg p-2 text-neutral-400 transition hover:bg-black/5 hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-neutral-200"
            aria-label={searchOpen ? "Close search" : "Search users"}
          >
            {searchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>

        {searchOpen && (
          <div className="border-b border-black/10 px-5 py-3 dark:border-neutral-800">
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-transparent px-3 dark:border-neutral-700">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={`Search ${activeTab}...`}
                autoFocus
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-neutral-400"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 border-b border-black/10 dark:border-neutral-800">
          {[
            ["following", "Following"],
            ["followers", "Followers"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => changeTab(tab)}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {label}
              {activeTab === tab && (
                <span className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          <p className="mb-4 text-xs text-neutral-500">
            {count} {count === 1 ? "person" : "people"}
          </p>
          {actionError && (
            <p className="mb-4 text-xs text-rose-500">{actionError}</p>
          )}

          {loading ? (
            <div className="flex justify-center py-12 text-indigo-500">
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-rose-500">{error}</p>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <UserRound className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">
                No {activeTab} yet.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">
              No users match “{searchText}”.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-indigo-500/20 text-center font-bold text-indigo-600 dark:text-indigo-300">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name || "Yapper"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          {(user.name || user.username || "Y")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {user.name || "Yapper"}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        @{user.username || "yapper"}
                      </p>
                    </div>
                  </Link>
                  {user.id !== currentUser?.id && (
                    <button
                      type="button"
                      onClick={() => handleFollowToggle(user)}
                      disabled={followLoadingId === user.id}
                      title={
                        followStates[user.id]
                          ? `Unfollow ${user.name || user.username || "user"}`
                          : `${activeTab === "followers" && isViewingOwnProfile ? "Follow back" : "Follow"} ${user.name || user.username || "user"}`
                      }
                      className={`group shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${
                        followStates[user.id]
                          ? "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                          : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                      }`}
                    >
                      {followLoadingId === user.id
                        ? "Updating..."
                        : followStates[user.id]
                          ? <><span className="group-hover:hidden">Following</span><span className="hidden group-hover:inline">Unfollow</span></>
                          : activeTab === "followers" && isViewingOwnProfile
                            ? "Follow back"
                            : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
