// Import required modules
import express from "express";               // Express framework for building the web server
import flashcardRoutes from "./routes/flashcardRoutes.js"; // Import flashcard routes
import path from "path";                    // Node.js path module for working with file/directory paths
import { pool } from "./config/db.js";      // Database connection pool
import methodOverride from "method-override"; // Middleware for HTTP method overriding

// Create Express application instance
const app = express();

// ******************************
// MIDDLEWARE SETUP
// ******************************

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(process.cwd(), "public")));

// Enable HTTP method overriding for RESTful routes
// Allows using PUT/DELETE in forms where client only supports GET/POST
app.use(methodOverride('_method', {
  methods: ['POST', 'GET']  // Allow method override on POST and GET requests
}));

// ******************************
// TEMPLATE ENGINE CONFIGURATION
// ******************************

// Set EJS as the template engine for rendering views
app.set("view engine", "ejs");

// Set the directory where the template files are located
app.set("views", path.join(process.cwd(), "views"));

// ******************************
// CUSTOM MIDDLEWARE
// ******************************

// Request logging middleware
// Logs timestamp, HTTP method, and URL of each request to the console
const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();  // Pass control to the next middleware function
};

// Register the logging middleware
app.use(loggingMiddleware);

// ******************************
// ROUTES
// ******************************

// Mount flashcard routes at the root path
app.use("/", flashcardRoutes);

// ******************************
// ERROR HANDLING
// ******************************

// 404 Error handler - catches any requests that don't match defined routes
app.use((req, res) => {
  res.status(404).send("404 Not Found.\n");
});

// ******************************
// SERVER INITIALIZATION
// ******************************

// Define the port number for the server to listen on
const PORT = 3001;

// Start the Express server
app.listen(PORT, () => {
  console.log(`Flashcard app running at http://localhost:${PORT}/`);
});