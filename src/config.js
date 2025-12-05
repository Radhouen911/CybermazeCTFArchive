// Configuration for the arcade theme
export const config = {
  // CTFd API base URL
  apiBaseUrl: "/api/v1",

  // Archive mode - use mock data from database export
  archiveMode: true,

  // Development server settings
  devServer: {
    port: 3000,
    ctfdProxyUrl: "http://localhost:8000",
  },
};
