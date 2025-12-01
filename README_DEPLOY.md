# Deployment notes

This file contains quick guidance for deploying the job-tracking-system backend.

1) Requirements

- Ensure `requirements.txt` is present at the repository root. Generate with:

```bash
./venv/bin/pip freeze > requirements.txt
```

2) Systemd (example)

Copy `deploy/gunicorn.service` to `/etc/systemd/system/gunicorn-jobtracking.service` and edit `User`, `Group` and `EnvironmentFile` to match your environment. Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn-jobtracking.service
sudo journalctl -u gunicorn-jobtracking.service -f
```

3) Docker

- Build image:
```bash
docker build -t job-tracking-system:latest .
```
- Run container:
```bash
docker run -d --name jobtracking -p 5000:5000 --env-file .env job-tracking-system:latest
```

4) Gunicorn tuning

- For production, increase worker count and tune worker class. Example for multiple workers:

```bash
./venv/bin/gunicorn -k eventlet -w 3 backend.app:app --bind 0.0.0.0:5000
```

5) Environment

- Use environment variables for all credentials and configuration. `backend/config.py` supports `DATABASE_URL` or `DB_USER/DB_PASSWORD/DB_HOST/DB_NAME`.
- Set `CORS_ORIGINS` to a comma-separated list of allowed origins in production.

6) Reverse proxy (Nginx)

- Use an Nginx server block to proxy `/api/` requests to the local Gunicorn socket or port. An example config is provided at `deploy/nginx-jobtracking.conf`.

7) Logging and log rotation

- Example logrotate configuration for gunicorn is provided at `deploy/logrotate-gunicorn.conf`. Copy it to `/etc/logrotate.d/` and edit paths as needed. Ensure Gunicorn writes logs to `/var/log/gunicorn/` or update the paths accordingly.

8) Database migrations

- Use the provided script to run migrations from the project root (requires venv with Flask-Migrate installed):

```bash
./scripts/run_migrations.sh
```

- Alternatively, run via the Flask CLI:

```bash
export FLASK_APP=backend.app
./venv/bin/flask db upgrade
```

