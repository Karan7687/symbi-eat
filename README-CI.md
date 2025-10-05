# CI/CD Setup for Realtime Pizza

### What’s included
- `Dockerfile` — builds Node.js app into container
- `.github/workflows/ci.yml` — runs install, build, and test
- `.github/workflows/docker-publish.yml` — builds & pushes Docker image to GHCR
- `.github/workflows/heroku-deploy.yml` — optional deploy to Heroku

### How to use
1. Commit and push these files to your `main` branch.
2. GitHub Actions will automatically run the **CI** workflow.
3. On successful push to `main`, **docker-publish.yml** builds and pushes the image.

### Optional secrets
- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` — for Docker Hub pushes  
- `HEROKU_API_KEY`, `HEROKU_APP_NAME`, `HEROKU_EMAIL` — for Heroku deploys  

### Local Docker test
```bash
docker build -t realtime-pizza .
docker run --rm -p 3100:3100 realtime-pizza
