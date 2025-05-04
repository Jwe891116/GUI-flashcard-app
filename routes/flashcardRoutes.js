// Import Express framework for creating routes
import express from "express";

// Import controller functions that handle the business logic for each route
import {
  getAllFlashcards,
  addFlashcard,
  deleteFlashcard,
  updateFlashcard,
  prepareEditFlashcard,
  startStudySession
} from "../controllers/flashcardController.js";

// Create a new router instance to define routes
const router = express.Router();

// Define routes and associate them with controller functions:

// GET / - Route to retrieve all flashcards (main page)
router.get("/", getAllFlashcards);

// POST /flashcards - Route to create a new flashcard
router.post('/flashcards', addFlashcard);

// POST /edit-flashcard - Route to prepare a flashcard for editing
router.post('/edit-flashcard', prepareEditFlashcard);

// DELETE /flashcards/:id - Route to delete a specific flashcard by ID
// :id is a route parameter that represents the flashcard's unique identifier
router.delete('/flashcards/:id', deleteFlashcard);

// PUT /flashcards/:id - Route to update an existing flashcard by ID
// Uses PUT HTTP method which is typically used for updates
router.put('/flashcards/:id', updateFlashcard);

// GET /study - Route to start a new study session
router.get('/study', startStudySession);

// GET /study/next - Route to navigate to next flashcard in study session
router.get('/study/next', startStudySession); 

// GET /study/previous - Route to navigate to previous flashcard in study session
router.get('/study/previous', startStudySession);

// Export the router to be used in the main application
export default router;