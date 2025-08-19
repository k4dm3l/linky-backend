export const config = {
  server: {
    port: process.env.PORT ?? 3000,
  },
  apiVersion: process.env.API_VERSION || "v1",
};
