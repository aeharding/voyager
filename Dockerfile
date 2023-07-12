# stage 0: set base image w/common customizations
FROM docker.io/library/node:lts-alpine AS base

# Prepare work directory
WORKDIR /wefwef

# enable corepack & set network-timeout
RUN corepack enable &&\
  pnpm config set network-timeout 300000


# stage 1: build
FROM base AS builder

# Prepare deps
RUN apk add --no-cache git

# Prepare build deps ( ignore postinstall scripts for now )
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy all source files
COPY . ./

# Build
RUN pnpm build


# stage 2: runtime
FROM base AS runner

ARG UID=911 GID=911

COPY package.json pnpm-lock.yaml server.mjs ./

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Create a dedicated user and group
RUN set -eux; \
    addgroup -g "${GID}" wefwef; \
    adduser -u "${UID}" -D -G wefwef wefwef

USER wefwef

ENV NODE_ENV=production PORT=5314

COPY --from=builder /wefwef/dist ./dist

EXPOSE 5314/tcp

CMD ["node","./server.mjs"]
