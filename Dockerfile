# stage 0: set base image w/common customizations
FROM oven/bun:1 AS base

# Prepare work directory
WORKDIR /usr/src/app

# stage 1: install
FROM base AS install

RUN mkdir -p /temp/dev

# Prepare build deps
# Copy .env conditionally https://stackoverflow.com/a/31532674/1319878
COPY package.json bun.lock bunfig.toml .en[v] /temp/dev/
COPY patches /temp/dev/patches

RUN cd /temp/dev && bun install --frozen-lockfile

# stage 2: builder
FROM base AS builder
COPY --from=install /temp/dev/node_modules node_modules

# Copy all source files

COPY package.json bun.lock bunfig.toml .en[v] ./
COPY patches ./patches
COPY index.html vite.config.ts manifest.json tsconfig.json ./
COPY public ./public
COPY scripts ./scripts
COPY src ./src

# Add APP_VERSION to .env if it doesn't already exist
RUN grep -q 'APP_VERSION=' .env || \
    echo "APP_VERSION=`bun -p \"require('./package.json').version\"`" >> .env

# Build
ENV BUILD_FOSS_ONLY=true
ENV NODE_ENV=production
RUN bun run build

# stage 3: runtime
FROM docker.io/library/nginx AS runner

ARG UID=911 GID=911

COPY scripts/docker_generate_config.sh /docker-entrypoint.d/generate_config.sh

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=builder /usr/src/app/dist /var/www

ENV NGINX_PORT=5314

EXPOSE 5314/tcp
