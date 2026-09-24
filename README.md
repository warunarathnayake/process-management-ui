# Process Management System - Web

Frontend web application for the Process Management System built with Angular 17.

## Running with Docker

### Using Docker Compose (Recommended)

1. Build and start the container:
   ```bash
   docker compose up --build
   ```

2. Open your browser and visit:
   ```
   http://localhost:4200
   ```

3. To run in background (detached mode):
   ```bash
   docker compose up -d --build
   ```

4. To stop the container:
   ```bash
   docker compose down
   ```

### Using Docker CLI directly

1. Build the Docker image:
   ```bash
   docker build -t process-management-ui ./process-management-ui
   ```

2. Run the container:
   ```bash
   docker run -d --name process-management-ui -p 4200:80 process-management-ui
   ```

3. Stop and remove the container:
   ```bash
   docker stop process-management-ui && docker rm process-management-ui
   ```

## Development without Docker

Refer to the [process-management-ui/README.md](process-management-ui/README.md) for local Angular development instructions.
