import fs from "node:fs"; // Import the Node.js file system module for file operations.
import { Hono } from "hono"; // Import the Hono framework for building the web server.
import { cors } from "hono/cors"; // Import CORS middleware for handling Cross-Origin Resource Sharing.
import { serveStatic } from "hono/bun"; // Import middleware for serving static files from the Bun server.
import path from "node:path"; // Import the Node.js path module for handling file paths.

// Define the uploads directory where files will be saved.
const uploadsDir = "./";

// Create a new Hono application instance.
const app = new Hono();

// Enable CORS for the application.
app.use(cors());

// Serve static files from the uploads directory for any request to /uploads/*
app.use(
  "/uploads/*",
  serveStatic({
    root: uploadsDir, // Specify the root directory for serving static files.
  })
);

// Define the root GET endpoint which returns a simple text response.
app.get("/", (c) => {
  return c.text("Hello World!"); // Respond with "Hello World!".
});

// Define the POST endpoint for uploading files to /uploads
app.post("/uploads", async (c) => {
  // Parse the request body to retrieve all form data.
  const body = await c.req.parseBody({ all: true });
  const files = body["file"]; // Get the uploaded files from the request.

  // Convert the files into an array if they are not already.
  const fileArray = Array.isArray(files) ? files : [files];

  // Filter out only valid File instances from the uploaded files.
  const validFiles = fileArray.filter((f): f is File => f instanceof File);

  // If no valid files were uploaded, return an error response.
  if (validFiles.length === 0) {
    return c.text("No valid files uploaded.", 400); // 400 Bad Request
  }

  const convertedVideos = []; // Array to hold the details of converted videos.

  // Iterate over each valid file for processing.
  for (const file of validFiles) {
    const videoId = crypto.randomUUID(); // Generate a unique ID for the video.

    // Construct a new filename for the uploaded file using the original name and the unique ID.
    const fileName =
      file.name.split(".")[0] + "-" + videoId + path.extname(file.name);
    const filePath = `./src/uploads/${fileName}`; // Define the path for saving the uploaded file.

    // Write the uploaded file to the filesystem.
    await Bun.write(filePath, file);

    const videoPath = `src/uploads/${fileName}`; // Path to the uploaded video file.
    const outputPath = `./src/uploads/converted/${
      file.name.split(".")[0]
    }-${videoId}`; // Path for storing converted video files.
    const hlsPath = `${outputPath}/index.m3u8`; // Path for the HLS playlist file.

    // Check if the output directory exists; if not, create it.
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true }); // Create directory structure if necessary.
    }

    // Define the ffmpeg command for converting the video to HLS format.
    const ffmpegCommand = [
      "ffmpeg",
      "-i", // Input file
      videoPath,
      "-codec:v",
      "libx264", // Video codec
      "-codec:a",
      "aac", // Audio codec
      "-hls_time",
      "10", // Duration of each segment in seconds
      "-hls_playlist_type",
      "vod", // Specify the type of playlist
      "-hls_segment_filename",
      `${outputPath}/segment%03d.ts`, // Output segment filenames
      "-start_number",
      "0", // Start numbering segments from 0
      hlsPath, // Output playlist file
    ];

    try {
      // Spawn the ffmpeg process to run the conversion command.
      const process = Bun.spawn(ffmpegCommand, {
        stdout: "pipe", // Pipe standard output
        stderr: "pipe", // Pipe standard error
      });

      // Set up streaming for stdout to log output messages.
      const stdout = new TextDecoderStream();
      process.stdout.pipeTo(stdout.writable);
      const reader = stdout.readable.getReader();
      reader.read().then(function logOutput({ done, value }) {
        if (done) return; // If done, exit the function.
        console.log(value); // Log the output value.
        reader.read().then(logOutput); // Continue reading.
      });

      // Set up streaming for stderr to log error messages.
      const stderr = new TextDecoderStream();
      process.stderr.pipeTo(stderr.writable);
      const errorReader = stderr.readable.getReader();
      errorReader.read().then(function logError({ done, value }) {
        if (done) return; // If done, exit the function.
        console.error(value); // Log the error value.
        errorReader.read().then(logError); // Continue reading.
      });

      // Wait for the ffmpeg process to finish and get the exit code.
      const result = await process.exited;

      // Check if the ffmpeg process exited successfully.
      if (result !== 0) {
        console.error(
          `FFmpeg process exited with code ${result} for file ${file.name}`
        ); // Log the error with the exit code.
        continue; // Move to the next file.
      }

      // Construct the URL for the converted video.
      const videoUrl = `http://localhost:5000/src/uploads/converted/${
        file.name.split(".")[0]
      }-${videoId}/index.m3u8`;
      // Add the converted video details to the array.
      convertedVideos.push({
        videoId,
        videoUrl,
        originalFileName: file.name,
      });
    } catch (error) {
      console.error(`Spawn error for file ${file.name}: ${error}`); // Log any errors during spawning.
    }
  }

  // If no videos were converted, return an error response.
  if (convertedVideos.length === 0) {
    return c.text("Error converting videos.", 500); // 500 Internal Server Error
  }

  // Return a JSON response with the converted videos' details.
  return c.json({
    message: "Videos converted to HLS format",
    videos: convertedVideos, // List of converted video details.
  });
});

// Start the Bun server on port 5000 with the Hono app as the request handler.
Bun.serve({
  port: 5000,
  fetch: app.fetch,
});
