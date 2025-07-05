const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const bookFilePath = path.join(__dirname, '..', 'data', 'Books.json');

const sendBook = async (req, res) => {
    const { title, author, genre, publishedYear } = req.body;

    try {
        let books = [];

        
        try {
            const data = await fs.readFile(bookFilePath, 'utf-8');
            books = data ? JSON.parse(data) : [];
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }

        // Check if book already exists
        const existingBook = books.find(book => book.title === title && book.author === author);
        if (existingBook) {
            return res.status(400).json({ message: 'Book already exists' });
        }

    
        const bookData = {
            id: uuidv4(),
            title,
            author,
            genre,
            publishedYear,
            userId: req.user.id
        };

        books.push(bookData);

    
        await fs.writeFile(bookFilePath, JSON.stringify([...books, bookData], null, 2));
        res.status(201).json({ message: 'Book added successfully', book: bookData });

    } catch (error) {
        console.log('Error adding book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const allBooks = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const data = await fs.readFile(bookFilePath, 'utf-8');
        const books = data ? JSON.parse(data) : [];

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);

        const paginatedBooks = books.slice(startIndex, endIndex);

        res.status(200).json({
            total: books.length,
            page: parseInt(page),
            limit: parseInt(limit),
            books: paginatedBooks
        });
    } catch (error) {
        console.log('Error fetching books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const singleBook = async (req, res) => {
    const { id } = req.params;

    try {
        const data = await fs.readFile(bookFilePath, 'utf-8');
        const books = data ? JSON.parse(data) : [];

        const book = books.find(b => b.id === id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json(book);
    } catch (error) {
        console.log('Error fetching book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, genre, publishedYear } = req.body;

    try {
        const data = await fs.readFile(bookFilePath, 'utf-8');
        let books = data ? JSON.parse(data) : [];

        const index = books.findIndex(b => b.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Update only provided fields
        books[index] = {
            ...books[index],
            title: title || books[index].title,
            author: author || books[index].author,
            genre: genre || books[index].genre,
            publishedYear: publishedYear || books[index].publishedYear
        };

        await fs.writeFile(bookFilePath, JSON.stringify(books, null, 2));
        res.status(200).json({ message: 'Book updated successfully', book: books[index] });
    } catch (error) {
        console.log('Error updating book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        const data = await fs.readFile(bookFilePath, 'utf-8');
        let books = data ? JSON.parse(data) : [];

        const newBooks = books.filter(b => b.id !== id);
        if (newBooks.length === books.length) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await fs.writeFile(bookFilePath, JSON.stringify(newBooks, null, 2));
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.log('Error deleting book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const searchBooksByGenre = async (req, res) => {
    const { genre } = req.query;

    try {
        const data = await fs.readFile(bookFilePath, 'utf-8');
        const books = data ? JSON.parse(data) : [];

        const filteredBooks = books.filter(book =>
            book.genre.toLowerCase() === genre.toLowerCase()
        );

        res.status(200).json(filteredBooks);
    } catch (error) {
        console.log('Error searching books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { allBooks, singleBook, sendBook, updateBook, deleteBook, searchBooksByGenre };
