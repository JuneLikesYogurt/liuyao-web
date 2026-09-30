/** @type {import('next').NextConfig} */
const isNextDev = process.argv.includes("dev");

const nextConfig = {
  output: "standalone",
  // next dev → .next-dev；next build / next start → .next（上传脚本只读 .next）
  distDir: isNextDev ? ".next-dev" : ".next",
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid EMFILE watcher errors on systems with low file descriptor limits.
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          "**/.git/**",
          "**/node_modules/**",
          "**/.next/**",
          "**/.next-dev/**"
        ]
      };
    }
    return config;
  }
};

export default nextConfig;
