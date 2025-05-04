// Import necessary functions from the flashcard model
import {
  fetchAllFlashcards,
  createFlashcard,
  modifyFlashcard,
  removeFlashcard,
  getTotalFlashcardsCount,
  getFlashcardsForStudy
} from "../models/flashcardModel.js";

// Controller function to get all flashcards with pagination and filtering
export const getAllFlashcards = async (req, res) => {
  try {
    // Extract query parameters with default values
    const { search, category, page = 1 } = req.query;
    const pageSize = 12; // Number of flashcards per page
    
    // Fetch paginated flashcards and total count from the model
    const flashcards = await fetchAllFlashcards(search, category, page, pageSize);
    const totalFlashcards = await getTotalFlashcardsCount(search, category);
    const totalPages = Math.ceil(totalFlashcards / pageSize); // Calculate total pages

    // Handle error messages passed via query parameters
    const errors = req.query.errors
      ? (Array.isArray(req.query.errors) ? req.query.errors : [req.query.errors])
      : null;

    // Render the index view with all necessary data
    res.render('index', {
      title: 'Flashcard App',
      flashcards,
      editingFlashcard: null, // No flashcard being edited initially
      errors,
      front: req.query.front || '', // Form field values
      back: req.query.back || '',
      category: req.query.category || '',
      difficulty: req.query.difficulty || 1,
      search: search || '', // Search term
      categoryFilter: category, // Current category filter
      currentPage: parseInt(page), // Current page number
      totalPages, // Total number of pages
      hasPreviousPage: page > 1, // Boolean for previous page availability
      hasNextPage: page < totalPages, // Boolean for next page availability
      studyMode: false // Not in study mode
    });
  } catch (err) {
    console.error("Error fetching flashcards:", err);
    res.status(500).send("Server Error");
  }
};

// Controller function to add a new flashcard
export const addFlashcard = async (req, res) => {
  // Extract flashcard data from request body
  const { front, back, category } = req.body;
  const difficulty = parseInt(req.body.difficulty) || 1; // Default difficulty to 1

  // Validate input fields
  const errors = validateFlashcardInput(front, back, category);
  if (errors.length > 0) {
    // If validation errors exist, redirect back with error messages and form data
    const queryParams = new URLSearchParams();
    errors.forEach(e => queryParams.append('errors', e));
    queryParams.set('front', front);
    queryParams.set('back', back || '');
    queryParams.set('category', category || '');
    queryParams.set('difficulty', difficulty);
    return res.redirect(`/?${queryParams.toString()}`);
  }

  try {
    // Create flashcard if validation passes
    await createFlashcard(front, back, category, difficulty);
    res.redirect('/');
  } catch (err) {
    console.error("Error adding flashcard:", err);
    res.status(500).send("Server Error");
  }
};

// Controller function to delete a flashcard
export const deleteFlashcard = async (req, res) => {
  const flashcardId = parseInt(req.params.id); // Get flashcard ID from URL
  try {
    await removeFlashcard(flashcardId); // Delete the flashcard
    res.redirect(req.headers.referer || '/'); // Redirect back to previous page or home
  } catch (err) {
    console.error("Error deleting flashcard:", err);
    res.status(500).send("Server Error");
  }
};

// Controller function to update an existing flashcard
export const updateFlashcard = async (req, res) => {
  const flashcardId = parseInt(req.params.id); // Get flashcard ID from URL
  const { front, back, category } = req.body; // Get updated data from form
  const difficulty = parseInt(req.body.difficulty) || 1; // Default difficulty to 1

  // Validate input fields
  const errors = validateFlashcardInput(front, back, category);
  if (errors.length > 0) {
    // If validation errors exist, redirect back with error messages and form data
    const queryParams = new URLSearchParams();
    errors.forEach(e => queryParams.append('errors', e));
    queryParams.set('front', front);
    queryParams.set('back', back || '');
    queryParams.set('category', category || '');
    queryParams.set('difficulty', difficulty);
    return res.redirect(`/?${queryParams.toString()}`);
  }

  try {
    // Update flashcard if validation passes
    await modifyFlashcard(flashcardId, front, back, category, difficulty);
    res.redirect('/');
  } catch (err) {
    console.error("Error updating flashcard:", err);
    res.status(500).send("Server Error");
  }
};

// Controller function to prepare the edit form for a flashcard
export const prepareEditFlashcard = async (req, res) => {
  // Get flashcard data from request body
  const { flashcardId, front, back, category, difficulty } = req.body;
  
  // Parse the referring URL to maintain pagination and filtering
  const refererUrl = new URL(req.headers.referer);
  const search = refererUrl.searchParams.get('search') || '';
  const categoryFilter = refererUrl.searchParams.get('category');
  const page = refererUrl.searchParams.get('page') || 1;

  try {
    // Fetch current flashcards with the same filters/pagination
    const flashcards = await fetchAllFlashcards(search, categoryFilter, page, 12);
    const totalFlashcards = await getTotalFlashcardsCount(search, categoryFilter);
    const totalPages = Math.ceil(totalFlashcards / 12);

    // Render the index view with the flashcard to edit
    res.render('index', {
      flashcards,
      editingFlashcard: { // The flashcard being edited
        id: flashcardId,
        front,
        back,
        category,
        difficulty
      },
      errors: null,
      front: '', // Clear form fields
      back: '',
      category: '',
      difficulty: 1,
      search: search || '',
      categoryFilter: categoryFilter,
      currentPage: parseInt(page),
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
      studyMode: false
    });
  } catch (err) {
    console.error("Error preparing to edit flashcard:", err);
    res.status(500).send("Server Error");
  }
};

// Controller function to handle study session navigation
export const startStudySession = async (req, res) => {
  const { category, currentIndex } = req.query; // Get study parameters
  const isPrevious = req.path.includes('/previous'); // Check if navigating to previous card
  let newIndex = currentIndex ? parseInt(currentIndex) : 0; // Current card index

  try {
      // Handle "All" category case
      const categoryFilter = (category === 'All' || !category) ? 'all' : category;
      const flashcards = await getFlashcardsForStudy(categoryFilter);

      if (flashcards.length === 0) {
          return res.redirect('/?errors=No flashcards found to study');
      }

      // Handle navigation between cards
      if (isPrevious) {
          newIndex = newIndex <= 0 ? flashcards.length - 1 : newIndex - 1; // Wrap around to end if at start
      } else {
          newIndex = newIndex >= flashcards.length - 1 ? 0 : newIndex + 1; // Wrap around to start if at end
      }

      // Render study mode view
      res.render('index', {
          title: 'Study Mode',
          flashcards,
          editingFlashcard: null,
          errors: null,
          front: '',
          back: '',
          category: '',
          difficulty: 1,
          search: '',
          categoryFilter: categoryFilter === 'all' ? 'All' : categoryFilter,
          currentPage: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
          studyMode: true, // Enable study mode
          currentCardIndex: newIndex // Current card index
      });
  } catch (err) {
      console.error("Error in study session:", err);
      res.status(500).send("Server Error");
  }
};

// Helper function to validate flashcard input fields
function validateFlashcardInput(front, back, category) {
  const errors = [];
  
  // Front (Question/Term) validation
  if (!front || front.trim().length === 0) {
    errors.push("Question/Term is required");
  } else if (front.trim().length < 3) {
    errors.push("Question/Term must be at least 3 characters");
  } else if (front.trim().length > 500) {
    errors.push("Question/Term cannot exceed 500 characters");
  }

  // Back (Answer/Definition) validation
  if (!back || back.trim().length === 0) {
    errors.push("Answer/Definition is required");
  } else if (back.trim().length > 1000) {
    errors.push("Answer/Definition cannot exceed 1000 characters");
  }

  // Category validation (optional field)
  if(!category || category.trim().length ===0) {
    errors.push("Category is required");
  }
  else if (category.trim().length > 50) {
    errors.push("Category cannot exceed 50 characters");
  }

  return errors;
};