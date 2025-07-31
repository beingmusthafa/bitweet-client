export const endpoints = {
  getProfile: "/auth/profile",
  getMyTweets: "/user/tweets/my-tweets",
  createTweet: "/user/tweets",
  deleteTweet: (id: string) => `/user/tweets/${id}`,
  updateTweet: (id: string) => `/user/tweets/${id}`,
  getFollowers: "/user/connections/followers",
  getFollowing: "/user/connections/following",
  follow: "/user/connections/follow",
  unfollow: "/user/connections/unfollow",
  getPeople: "/user/connections/people",
  getFeed: "/user/tweets/",
} as const;
