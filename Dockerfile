# stage 0: set base image w/common customizations
FROM docker.io/library/node:lts-alpine AS base

# Prepare work directory
WORKDIR /voyager

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV BUILD_FOSS_ONLY=true

# enable corepack & set network-timeout
RUN corepack enable && \
  pnpm config set network-timeout 300000


# stage 1: build
FROM base AS builder

# Prepare deps
RUN apk add --no-cache git

# Prepare build deps
# Copy .env conditionally https://stackoverflow.com/a/31532674/1319878
COPY package.json pnpm-lock.yaml .npmrc .en[v] ./
COPY patches ./patches

# Add APP_VERSION to .env if it doesn't already exist
RUN grep -q 'APP_VERSION=' .env || \
    echo "APP_VERSION=`node -p \"require('./package.json').version\"`" >> .env

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy all source files
COPY index.html vite.config.ts manifest.json tsconfig.json compilerOptions.js ./
COPY public ./public
COPY scripts ./scripts
COPY src ./src

# Build
RUN pnpm build


# stage 2: runtime
FROM docker.io/library/nginx AS runner

ARG UID=911 GID=911

COPY scripts/docker_generate_config.sh /docker-entrypoint.d/generate_config.sh

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=builder /voyager/dist /var/www

ENV NGINX_PORT=5314

EXPOSE 5314/tcp
