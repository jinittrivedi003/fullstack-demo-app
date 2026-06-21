const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const auth = require('../middleware/auth.middleware');

router.get('/pdf', auth, documentController.generatePDF);
router.get('/docx', auth, documentController.generateDOCX);

module.exports = router;
