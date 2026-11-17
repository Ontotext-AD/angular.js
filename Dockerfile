# Build and test environment for the AngularJS 1.3.x fork.
# Node 4 + npm 2 is the combination the upstream Travis CI used last on this branch.
# The base is a supported Debian; the old toolchain comes from official release tarballs.
FROM debian:bookworm-slim

ARG NODE_VERSION=4.9.1
ARG JAVA_RELEASE=jdk8u472-b08
ARG FIREFOX_VERSION=68.12.0esr

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates curl git bzip2 xz-utils \
      libgtk-3-0 libdbus-glib-1-2 libxt6 libx11-xcb1 libasound2 \
 && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
      | tar -xJ -C /usr/local --strip-components=1

# Java 8 runs the Closure Compiler used by `grunt minify`.
RUN mkdir -p /opt/java \
 && curl -fsSL "https://github.com/adoptium/temurin8-binaries/releases/download/${JAVA_RELEASE}/OpenJDK8U-jre_x64_linux_hotspot_$(echo ${JAVA_RELEASE} | sed 's/^jdk//; s/-//').tar.gz" \
      | tar -xz -C /opt/java --strip-components=1
ENV PATH=/opt/java/bin:$PATH

# A pinned Firefox ESR runs the Karma unit tests headless (MOZ_HEADLESS needs no launcher support).
RUN curl -fsSL "https://archive.mozilla.org/pub/firefox/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2" \
      | tar -xj -C /opt \
 && ln -s /opt/firefox/firefox /usr/local/bin/firefox

# GitHub no longer serves the unauthenticated git:// protocol used in npm-shrinkwrap.json.
RUN git config --system url."https://github.com/".insteadOf git://github.com/

RUN npm install -g grunt-cli@0.1.13

# The Firefox content sandbox cannot start under Docker's default seccomp profile; the content
# processes crash and Karma never captures the browser.
ENV MOZ_HEADLESS=1 \
    MOZ_DISABLE_CONTENT_SANDBOX=1 \
    FIREFOX_BIN=/usr/local/bin/firefox
