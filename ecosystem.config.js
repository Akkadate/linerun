module.exports = {
  apps: [
    {
      name: "running-app-frontend-dev",
      script: "npm",
      args: "run dev",
      cwd: "./running-app-frontend",
      env: {
        NODE_ENV: "development",
        PORT: 3250
      },
      watch: [
        "src",
        "public"
      ],
      ignore_watch: [
        "node_modules",
        "build",
        ".git"
      ],
      watch_options: {
        followSymlinks: false
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
    {
      name: "running-app-backend-dev",
      script: "npm",
      args: "run dev",
      cwd: "./running-app-backend",
      env: {
        NODE_ENV: "development",
        PORT: 4800
      },
      watch: [
        "src"
      ],
      ignore_watch: [
        "node_modules",
        ".git"
      ],
      watch_options: {
        followSymlinks: false
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
