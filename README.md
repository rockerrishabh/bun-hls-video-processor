# Video Upload and HLS Conversion Server

This project sets up a web server using Bun and Hono that allows users to upload video files, which are then processed and converted into HLS (HTTP Live Streaming) format. The server supports CORS and serves static files from a specified uploads directory.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [GET /](#get-)
  - [POST /uploads](#post-uploads)
- [Directory Structure](#directory-structure)
- [License](#license)

## Features

- Hndle routes using Hono.using Hono.
- Basic CORS support for cross-origin requests.
- Serve static files from a specified uploads directory.
- Upload video files in various formats.
- Convert uploaded videos to HLS format using `ffmpeg`.
- Error handling for file uploads and conversions.

## Requirements

- [Bun](https://bun.sh/) - A JavaScript runtime like Node.js.
- [Hono](https://hono.dev/) - A lightweight web framework for Bun.
- [ffmpeg](https://ffmpeg.org/) - A command-line tool for video and audio processing.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rockerrishabh/bun-hls-video-processor.git
   cd bun-hls-video-processor
   ```

2. To install dependencies:

   ```bash
   bun install
   ```

3. To run:

   ```bash
   bun run index.ts
   ```

This project was created using `bun init` in bun v1.1.33. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
