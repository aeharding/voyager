<p align="center">
  <a href="https://vger.app" target="_blank" rel="noopener noreferrer">
    <img width="160" height="160" src="./public/logo-minified.svg" alt="Voyager logo">
  </a>
</p>

<h1 align="center"/>Voyager <sup><em>alpha</em></sup></h1>

<p align="center">
A mobile-first Lemmy web client
</p>

<p align="center">
(formerly wefwef)
</p>

<br/>
<p align="center">
  <a href="https://matrix.to/#/#vger.app:matrix.org"><img src="https://img.shields.io/badge/chat-matrix-blue?style=flat&logo=matrix" alt="matrix chat"></a>
</p>
<br/>

<p align="center">
  <a href="https://vger.app/" target="_blank" rel="noopener noreferrer" >
    <img src="./public/promo.png" alt="Voyager screenshots" width="600" height="auto">
  </a>
</p>

## ⚠️ Voyager is in Alpha

Voyager is an [Apollo-like](https://apolloapp.io/) open source web client for [Lemmy](https://join-lemmy.org/). It's a mobile-first app, but works great on desktop devices, too. Please feel free to try it out, but be aware you will likely encounter bugs and missing functionality.

**What does Voyager currently support?**

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
- Deleting/editing comments
- Deleting/editing posts
- Swipe to hide posts
- Saving/bookmarking
- Favorites
- Android theme (beta)

**What is on the roadmap?**

- More customization
- Native notifications and badging
- Translations
- ...and more!

## 💪 Mobile webapps are awesome

Native apps can be great, but we believe in the strengths of the web. Why use a web-based Lemmy client?

- **Cross-platform** Use the familiar Voyager interface on your phone, tablet, desktop computer, and more!
- **Self-hostable** No worries about your favorite app getting taken down, and you can customize to your desire!
- **Lightweight** No large installation bundles - and it's easy to try it out

## Deployment

### Official Deployment

The Voyager team maintains a deployment at:

- 🐭 Production: [vger.app](https://vger.app)

### Self-Host Docker Deployment

In order to host Voyager yourself you can use the provided Dockerfile to build a container with Voyager. The Docker container itself does not provide any SSL/TLS handling. You'll have to add this bit yourself.
One could put Voyager behind popular reverse proxies with SSL Handling like Traefik, NGINX etc.

> **Tip:** Use [Watchtower](https://github.com/containrrr/watchtower) to keep your deployment automatically up to date!

#### Environment variables

- `CUSTOM_LEMMY_SERVERS` (optional) e.g. `lemmy.world,lemmy.ml,sh.itjust.works` - a comma separated list of suggested servers. The first will be used as default view for logged out users. You can specify only one if you want.

#### From source

1. checkout source `git clone https://github.com/aeharding/voyager.git`
1. go into new source dir: `cd voyager`
1. build Docker image: `docker build . -t voyager`
1. start container: `docker run --init --rm -it -p 5314:5314 voyager`

#### Prebuilt

1. pull image `docker pull ghcr.io/aeharding/voyager:latest`
1. start container: `docker run --init --rm -it -p 5314:5314 voyager`

Note: The provided Dockerfile creates a container which will eventually run Voyager as non-root user.

### Ecosystem

- 🇫🇮 [m.lemmy.world](https://m.lemmy.world) - Voyager hosted by the mastodon.world team. [Contact/privacy](https://mastodon.world/about)
- 🇸🇬 [v.opnxng.com](https://v.opnxng.com) - Voyager hosted by Opnxng in Singapore. [Contact/privacy](https://about.opnxng.com)
- 🇲🇽 [voyager.nohost.network](https://voyager.nohost.network) - Voyager hosted by Nohost in Mexico. [Contact/privacy](https://nohost.network)

> **Note**: Community deployments are **NOT** maintained by the Voyager team. They may not be synced with Voyager's source code. Please do your own research about the host servers before using them.

## 💖 Sponsors

If you're enjoying Voyager, you can sponsor it:

- [Alexander Harding](https://github.com/sponsors/aeharding)

We would also appreciate sponsoring other contributors to Voyager. If someone helps you solve an issue or implement a feature you wanted, supporting them would help make this project and OS more sustainable.

## 🧑‍💻 Contributing

We're really excited that you're interested in contributing to Voyager!

> **NOTE** Voyager is receiving a lot of new users and interest in contributing. Before contributing, [please read this](https://github.com/aeharding/voyager/discussions/180). 🙂

### Local Setup

Clone the repository and run on the root folder:

```
pnpm install
pnpm run dev
```

`Warning`: you will need `corepack` enabled.

### Testing

Voyager uses [Vitest](https://vitest.dev). You can run the test suite with:

```
pnpm test
```

## 📲 PWA

Voyager works best added to the homescreen. There are certain features that only work there, like badging and smooth page transitions.

## 🦄 Stack

- [React](https://react.dev/) - The library for web and native user interfaces
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Ionic](https://ionicframework.com/) - The mobile SDK for the Web
- [Virtuoso](https://virtuoso.dev/) - Display large data sets using virtualized rendering
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) - Prompt for update, Web Push Notifications and Web Share Target API

## 👨‍💻 Contributors

Shoutout to [@fer0n](https://github.com/fer0n) for the great logo and splashscreen! And thank you 💙 all of our contributors to the codebase:

<a href="https://github.com/aeharding/voyager/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=aeharding/voyager" />   
</a>

## 📄 License

### Logo & Splashscreen

CC BY-SA 4.0 &copy; [@fer0n](https://github.com/fer0n)

### Code

[AGPL-3.0](./LICENSE) &copy; Voyager contributors
