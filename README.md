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

- Upload video files in various formats.
- Convert uploaded videos to HLS format using `ffmpeg`.
- Serve both original and converted video files.
- Basic CORS support for cross-origin requests.
- Error handling for file uploads and conversions.

## Requirements

- [Bun](https://bun.sh/) - A JavaScript runtime like Node.js.
- [ffmpeg](https://ffmpeg.org/) - A command-line tool for video and audio processing.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
