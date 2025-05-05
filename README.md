## Flashcard App

A full-featured web-based Flashcard Application built using Node.js, Express, PostgreSQL, and EJS. This app helps users create, organize, and study digital flashcards with an intuitive interface and powerful study tools.

---

## Features

- **Create Flashcards**: Add flashcards with front (question/term) and back (answer/definition) content
- **Edit Flashcards**: Modify existing flashcards
- **Delete Flashcards**: Remove flashcards you no longer need
- **Organize by Category**: Categorize flashcards for better organization
- **Difficulty Levels**: Set difficulty (1-5) with visual indicators
- **Study Mode**: Interactive study session with flip animation
- **Search & Filter**: Search by content or filter by category
- **Pagination**: View 12 flashcards per page
- **Validation**: Input validation for both client and server
- **RESTful API**: Clean RESTful routes with method override support
- **Responsive UI**: Dynamic EJS templates with modern CSS styling

---

## Prerequisites

- [Node.js] (v14+)
- [PostgreSQL]
- npm (included with Node.js)

---

## Installation

### 1. Clone the Repository

```bash
https://github.com/Jwe891116/GUI-flashcard-app.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup the Database

Create a PostgreSQL database and run:

```sql
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  category VARCHAR(50),
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DB_USER=your_pg_username
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_pg_password
DB_PORT=5432
```

---

## Running the App

Start the server with:

```bash
npm start
```

Then open your browser and go to:

```
http://localhost:3001/
```

---

## Project Structure

```
|-- config/
|   |-- db.js                   # PostgreSQL configuration
|-- controllers/
|   |-- flashcardController.js  # Business logic for routes
|-- models/
|   |-- flashcardModel.js       # SQL queries and DB functions
|-- routes/
|   |-- flashcardRoutes.js      # Express router definitions
|-- views/
|   |-- |partials/
|   |   |-- | header.ejs        # Partials for EJS template
            | footer.ejs
|   |-- index.ejs               # Main EJS template
|-- public/
|   |-- style.css               # Stylesheet
|-- app.js                      # Main application file
|-- .env                        # Environment configuration
|-- package.json                # Project metadata
```

---

## API Endpoints

| Method | Route             | Description                                  |
|--------|-------------------|----------------------------------------------|
| GET    | `/`               | Render flashcard with pagination/filtering   |
| POST   | `/flashcard`      | Add a new flashcard                          |
| POST   | `/edit-flashcard` | Load flashcard for editing                   |
| PUT    | `/flashcard/:id`  | Update flashcard completion                  |
| DELETE | `/flashcard/:id`  | Delete flashcard details                     |
| GET    | `/study`          | Start study session                          |
| GET    | `/study/next`     | Navigate to next flashcard in study mode     |
| GET    | `study/previous`  | Navigate to previous flashcard in study mood |

### Query Parameters (for GET `/`)

- `search` – Search term for front/back content  
- `category` – Filter by specific category   
- `page` – Page number (pagination)

---

## Validation Rules

- Front Content:
  - Required
  - 3–500 characters
- Back Content:
  - Required
  - Max 100 characters
- Category
  - Required
  - Max 50 characters

Errors will be passed as query strings and rendered on the UI.

---

## Study Mode Features

 - Flip animation to reveal answers
 - Random card ordering
 - Category-specific study sessions
 - Navigation between cards (Previous/Next)
 - Visual difficulty indicators
 - Exit study mode button

---

## Database Configuration

PostgreSQL is used via the `pg` library with connection pooling. See `config/db.js` for full setup.

Connection tested and logged when the app starts.

---

## PowerPoint Presentation

View presentation in the repository.

---

## License

MIT License.  
Feel free to use and customize this app as needed!
