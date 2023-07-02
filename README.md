<p align="center">
  <a href="https://wefwef.app" target="_blank" rel="noopener noreferrer">
    <img width="160" height="160" src="./public/logo.png" alt="wefwef logo">
  </a>
</p>

<h1 align="center"/>wefwef <sup><em>alpha</em></sup></h1>

<p align="center">
A mobile-first Lemmy web client
</p>

<br/>
<p align="center">
  <a href="https://matrix.to/#/#wefwef.app:matrix.org"><img src="https://img.shields.io/badge/chat-matrix-blue?style=flat&logo=matrix" alt="matrix chat"></a>
</p>
<br/>

<p align="center">
  <a href="https://wefwef.app/" target="_blank" rel="noopener noreferrer" >
    <img src="./public/promo.png" alt="wefwef screenshots" width="600" height="auto">
  </a>
</p>

## ⚠️ wefwef is in Alpha

wefwef is an [Apollo-like](https://apolloapp.io/) open source web client for [Lemmy](https://join-lemmy.org/). It's a mobile-first app, but works great on desktop devices, too. Please feel free to try it out, but be aware you will likely encounter bugs and missing functionality.

**What does wefwef currently support?**

- Light/dark mode
- View and subscribe to communities
- Multi account support
- Single comment thread context view
- Upvote, downvote and reply to threads and comments
- Interact with user profiles
- Comment thread collapsing
- A bunch of swipe gestures
- Messaging, mentions and replies
- Creating new posts (url/photo/text)

**What is on the roadmap?**

- Android theme
- Deleting/editing posts/comments
- Native notifications and badging
- ...and more!

## 💪 Mobile webapps are awesome

Native apps can be great, but we believe in the strengths of the web. Why use a web-based Lemmy client?

- **Cross-platform** Use the familiar wefwef interface on your phone, tablet, desktop computer, and more!
- **Self-hostable** No worries about your favorite app getting taken down, and you can customize to your desire!
- **Lightweight** No large installation bundles - and it's easy to try it out

## Deployment

### Official Deployment

The wefwef team maintains a deployment at:

- 🐭 Production: [wefwef.app](https://wefwef.app)

### Self-Host Docker Deployment

In order to host wefwef yourself you can use the provided Dockerfile to build a container with wefwef. The Docker container itself does not provide any SSL/TLS handling. You'll have to add this bit yourself.
One could put wefwef behind popular reverse proxies with SSL Handling like Traefik, NGINX etc.

> **Tip:** Use [Watchtower](https://github.com/containrrr/watchtower) to keep your deployment automatically up to date!

#### Environment variables

- `CUSTOM_LEMMY_SERVERS` (optional) e.g. `lemmy.world,lemmy.ml,sh.itjust.works` - a comma separated list of suggested servers. The first will be used as default view for logged out users. You can specify only one if you want.

#### From source

1. checkout source `git clone https://github.com/aeharding/wefwef.git`
1. go into new source dir: `cd wefwef`
1. build Docker image: `docker build . -t wefwef`
1. start container: `docker run --rm -it -p 5314:5314 wefwef`

#### Prebuilt

1. pull image `docker pull ghcr.io/aeharding/wefwef:latest`
1. start container: `docker run --rm -it -p 5314:5314 wefwef`

Note: The provided Dockerfile creates a container which will eventually run wefwef as non-root user.

### Ecosystem

- 🇸🇬 [w.opnxng.com](https://w.opnxng.com) - wefwef hosted by Opnxng in Singapore. [Contact/privacy](https://about.opnxng.com)

> **Note**: Community deployments are **NOT** maintained by the wefwef team. They may not be synced with wefwef's source code. Please do your own research about the host servers before using them.

## 💖 Sponsors

If you're enjoying wefwef, you can sponsor it:

- [Alexander Harding](https://github.com/sponsors/aeharding)

We would also appreciate sponsoring other contributors to wefwef. If someone helps you solve an issue or implement a feature you wanted, supporting them would help make this project and OS more sustainable.

## 🧑‍💻 Contributing

We're really excited that you're interested in contributing to wefwef!

> **NOTE** wefwef is receiving a lot of new users and interest in contributing. Before contributing, [please read this](https://github.com/aeharding/wefwef/discussions/180). 🙂

### Local Setup

Clone the repository and run on the root folder:

```
yarn
yarn run dev
```

`Warning`: you will need `corepack` enabled.

### Testing

wefwef uses [Vitest](https://vitest.dev). You can run the test suite with:

```
yarn test
```

## 📲 PWA

wefwef works best added to the homescreen. There are certain features that only work there, like badging and smooth page transitions.

## 🦄 Stack

- [React](https://react.dev/) - The library for web and native user interfaces
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Ionic](https://ionicframework.com/) - The mobile SDK for the Web
- [Virtuoso](https://virtuoso.dev/) - Display large data sets using virtualized rendering
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) - Prompt for update, Web Push Notifications and Web Share Target API

## 👨‍💻 Contributors

<a href="https://github.com/aeharding/wefwef/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=aeharding/wefwef" />   
</a>

## 📄 License

[AGPL-3.0](./LICENSE) &copy; wefwef contributors
