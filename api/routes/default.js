import express from 'express';
import fileUpload from 'express-fileupload';

import { printPDF, uploadImage } from '../controllers/default.js';

const router = express.Router();

router.post(
	'/upload',
	fileUpload({ createParentPath: true }),
	uploadImage
);

router.get(
	'/print',
	printPDF
);

export default router;
