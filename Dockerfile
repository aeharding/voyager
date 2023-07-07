FROM docker.io/library/node:lts-alpine AS base

# Prepare work directory
WORKDIR /wefwef

FROM base AS builder

RUN corepack enable

# Prepare deps
RUN apk update
RUN apk add git --no-cache

# Prepare build deps ( ignore postinstall scripts for now )
COPY package.json ./
COPY yarn.lock ./
RUN yarn config set network-timeout 300000
RUN yarn --frozen-lockfile --ignore-scripts

# Copy all source files
COPY . ./

# Build
RUN yarn build

FROM base AS runner

ARG UID=911
ARG GID=911

RUN corepack enable

COPY package.json ./
COPY yarn.lock ./
COPY server.mjs ./

RUN yarn config set network-timeout 300000
RUN yarn --prod --frozen-lockfile --ignore-scripts

# Create a dedicated user and group
RUN set -eux; \
    addgroup -g $GID wefwef; \
    adduser -u $UID -D -G wefwef wefwef;

USER wefwef

ENV NODE_ENV=production

COPY --from=builder /wefwef/dist ./dist

EXPOSE 5314/tcp

ENV PORT=5314

CMD ["node", "./server.mjs"]
