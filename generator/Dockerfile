# syntax=docker/dockerfile:1

FROM python:3.11-slim

ARG DEBIAN_FRONTEND=noninteractive

# Install system deps: cron, git, curl, ca-certificates, build-essential, golang, cairo
RUN apt-get update --fix-missing \
    && apt-get install -y --no-install-recommends \
       cron \
       ca-certificates \
       curl \
       git \
       build-essential \
       golang-go \
       libcairo2-dev \
       libpango1.0-dev \
       libgdk-pixbuf-xlib-2.0-dev \
       libffi-dev \
       shared-mime-info \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set timezone via TZ env if provided
ENV TZ=UTC

WORKDIR /app

# Copy project files needed for generation
COPY lib /app/lib
COPY generator /app/generator
COPY go.mod /app/go.mod
COPY go.sum /app/go.sum
# Create site directory structure but don't copy assets (they'll come from volume)
RUN mkdir -p /app/site/assets

# Python deps
RUN pip install --no-cache-dir -r /app/generator/requirements.txt

# Initialize Go module and download dependencies
RUN cd /app && go mod download

# Ensure run script is executable
RUN chmod +x /app/generator/run-generation.sh

# Create log file and cron job that runs at 3 AM UTC daily
RUN touch /var/log/cron.log \
    && echo "* * * * * /app/generator/run-generation.sh >> /var/log/cron.log 2>&1" > /etc/cron.d/generator-cron \
    && chmod 0644 /etc/cron.d/generator-cron \
    && crontab /etc/cron.d/generator-cron

# Run cron in the foreground and tail the log file to show output in Docker logs
CMD ["/bin/sh", "-c", "cron && tail -f /var/log/cron.log"]
