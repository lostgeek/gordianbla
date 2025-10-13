# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=20.18.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /srv

# Install pnpm
RUN npm install -g pnpm

################################################################################
# Create a stage for installing production dependencies.
FROM base as deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.pnpm-store to speed up subsequent builds.
# Leverage bind mounts to package.json and pnpm-lock.yaml to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --prod --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM deps as build

# Install all dependencies (including dev dependencies) needed for building
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.pnpm-store \
    pnpm install

# Copy the rest of the source files into the image.
COPY . .

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Set build-time environment to prevent MongoDB connection during build
ENV NUXT_BUILD=true

# Run the build script.
RUN pnpm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
RUN chown node:node /srv
USER node

# Copy package.json so that package manager commands can be used.
COPY --chown=node:node package.json .

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --chown=node:node --from=deps /srv/node_modules ./node_modules
COPY --chown=node:node --from=build /srv/.output ./.output

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD node /srv/.output/server/index.mjs
