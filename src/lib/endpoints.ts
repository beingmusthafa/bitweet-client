export const endpoints = {
  getProfile: "/auth/profile",
  getMyTweets: "/user/tweets/my-tweets",
  deleteTweet: (id: string) => `/tweets/${id}`,
  updateTweet: (id: string) => `/tweets/${id}`,
  getFollowers: "/user/connections/followers",
  getFollowing: "/user/connections/following",
  getPeople: "/user/connections/people",
} as const;
