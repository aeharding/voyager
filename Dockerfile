# stage 0: set base image w/common customizations
FROM docker.io/library/node:lts-alpine AS base

# Prepare work directory
WORKDIR /voyager

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV BUILD_FOSS_ONLY=true

# enable corepack & set network-timeout
RUN corepack enable &&\
  pnpm config set network-timeout 300000


# stage 1: build
FROM base AS builder

# Prepare deps
RUN apk add --no-cache git

# Prepare build deps ( ignore postinstall scripts for now )
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

# Copy all source files
COPY . ./

# Build
RUN pnpm build


# stage 2: runtime
FROM docker.io/library/nginx AS runner

ARG UID=911 GID=911

COPY generate_config.sh ./
COPY ["generate_config.sh", "/docker-entrypoint.d/generate_config.sh"]

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /voyager/dist /var/www
