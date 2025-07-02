const express = require('express');
const router= express.Router();
const {allBooks, singleBook, sendBook,updateBook,deleteBook, searchBooksByGenre} = require('../controllers/BookController');
const { userAuth } = require('../middlewares/auth');

router.post('/',userAuth, sendBook);
router.get('/', allBooks);
router.get('/:id', singleBook);
router.put('/:id',userAuth, updateBook); 
router.delete('/:id',userAuth, deleteBook);
router.get('/search', searchBooksByGenre);



module.exports= router;