// Import the database connection pool from our configuration
import { pool } from "../config/db.js";

/**
 * Retrieves paginated flashcards with optional filtering
 * @param {string} [searchTerm=''] - Term to search in both front and back of cards
 * @param {string} [category='All'] - Category filter ('All' returns all categories)
 * @param {number} [page=1] - Current page number for pagination
 * @param {number} [pageSize=12] - Number of items per page
 * @returns {Promise<Array>} Array of flashcard objects
 * @throws {Error} If database query fails
 */
export const fetchAllFlashcards = async (
  searchTerm = '', 
  category = 'All', 
  page = 1, 
  pageSize = 12
) => {
  try {
    // Base query to select all flashcards
    let query = "SELECT * FROM flashcards";
    const params = []; // Stores query parameters to prevent SQL injection
    const conditions = []; // Stores WHERE conditions

    // Add search term condition if provided
    if (searchTerm.trim()) {
      // ILIKE for case-insensitive search, % for wildcard matching
      conditions.push(`(front ILIKE $${params.length + 1} OR back ILIKE $${params.length + 1})`);
      params.push(`%${searchTerm.trim()}%`);
    }

    // Add category filter only if not 'All' (case-insensitive check)
    if (category && category.toLowerCase() !== 'all') {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    // Combine conditions with AND if any exist
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Sort by creation date (newest first) for better UX
    query += " ORDER BY created_at DESC";
    
    // Add pagination using LIMIT and OFFSET
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, (page - 1) * pageSize);

    // Execute query and return results
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw new Error("Failed to fetch flashcards");
  }
};

/**
 * Counts total flashcards matching optional filters
 * @param {string} [searchTerm=''] - Search term filter
 * @param {string} [category='All'] - Category filter ('All' counts all)
 * @returns {Promise<number>} Total count of matching flashcards
 * @throws {Error} If database query fails
 */
export const getTotalFlashcardsCount = async (searchTerm = '', category = 'All') => {
  try {
    // Base count query
    let query = "SELECT COUNT(*) FROM flashcards";
    const params = [];
    const conditions = [];

    // Search term filter
    if (searchTerm.trim()) {
      conditions.push(`(front ILIKE $${params.length + 1} OR back ILIKE $${params.length + 1})`);
      params.push(`%${searchTerm.trim()}%`);
    }

    // Category filter (skipped if 'All')
    if (category && category.toLowerCase() !== 'all') {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    // Combine conditions if any exist
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Execute query and parse result as integer
    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].count, 10);
  } catch (error) {
    console.error("Error counting flashcards:", error);
    throw new Error("Failed to get flashcard count");
  }
};

/**
 * Creates a new flashcard in database
 * @param {string} front - The question/term (front side)
 * @param {string} back - The answer/definition (back side)
 * @param {string} category - Category for the flashcard
 * @param {number} [difficulty=1] - Difficulty level (1-5)
 * @returns {Promise<void>}
 * @throws {Error} If creation fails
 */
export const createFlashcard = async (
  front, 
  back, 
  category, 
  difficulty = 1
) => {
  try {
    // Parameterized query to prevent SQL injection
    await pool.query(
      `INSERT INTO flashcards 
       (front, back, category, difficulty) 
       VALUES ($1, $2, $3, $4)`,
      [
        front.trim(),       // Trim whitespace from inputs
        back.trim(),
        category?.trim() || null, // Handle empty category
        difficulty
      ]
    );
  } catch (error) {
    console.error("Error creating flashcard:", error);
    throw new Error("Failed to create flashcard");
  }
};

/**
 * Updates an existing flashcard
 * @param {number} id - ID of flashcard to update
 * @param {string} front - Updated front content
 * @param {string} back - Updated back content
 * @param {string} category - Updated category
 * @param {number} difficulty - Updated difficulty
 * @returns {Promise<void>}
 * @throws {Error} If update fails
 */
export const modifyFlashcard = async (
  id, 
  front, 
  back, 
  category, 
  difficulty
) => {
  try {
    // Update query that also sets the updated_at timestamp
    await pool.query(
      `UPDATE flashcards 
       SET front = $1, back = $2, category = $3, 
           difficulty = $4, updated_at = NOW() 
       WHERE id = $5`,
      [
        front.trim(),
        back.trim(),
        category?.trim() || null,
        difficulty,
        id
      ]
    );
  } catch (error) {
    console.error("Error updating flashcard:", error);
    throw new Error("Failed to update flashcard");
  }
};

/**
 * Deletes a flashcard from database
 * @param {number} id - ID of flashcard to delete
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails
 */
export const removeFlashcard = async (id) => {
  try {
    // Simple delete query by ID
    await pool.query("DELETE FROM flashcards WHERE id = $1", [id]);
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    throw new Error("Failed to delete flashcard");
  }
};

/**
 * Retrieves randomized flashcards for study session
 * @param {string} [category='All'] - Category filter ('All' returns all)
 * @returns {Promise<Array>} Array of flashcards in random order
 * @throws {Error} If query fails
 */
export const getFlashcardsForStudy = async (category = 'All') => {
  try {
    let query = "SELECT * FROM flashcards";
    const params = [];

    // Apply category filter if not 'All'
    if (category && category.toLowerCase() !== 'all') {
      query += " WHERE category = $1";
      params.push(category);
    }

    // Randomize order for study purposes
    query += " ORDER BY RANDOM()";
    
    // Execute and return results
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching flashcards for study:", error);
    throw new Error("Failed to get flashcards for study");
  }
};