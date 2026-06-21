const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, profileController.getProfile);

router.put(
  '/personal-details',
  auth,
  (req, res, next) => {
    profileController.upload.array('attachments', 5)(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  profileController.updatePersonalDetails
);

router.put('/change-password', auth, profileController.changePassword);

router.delete('/attachments/:attachmentId', auth, profileController.deleteAttachment);

module.exports = router;
