const express = require('express');
const router = express.Router();
const authUser = require('../app/middlewares/auth');
const authenticateJWT = require('../app/middlewares/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const blogController = require('../app/controllers/blog')
//Endpoints
//authenticateJWT,
router.post(
  '/create-blog/',
  upload.array('images', 10),
  blogController.createBlog,
);
router.get('/', blogController.listBlog)
router.get('/:blogId/get-comments/', blogController.getComments);
router.post('/:blogId/post-comment/', authenticateJWT, blogController.postComment);
router.get('/:id', blogController.DetailBlog)

module.exports = router;
