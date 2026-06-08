const streamifier = require('streamifier');
const { cloudinary } = require('../config/cloudinary');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'team-collaboration',
          resource_type: 'auto',
          public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const fileType = req.file.mimetype.startsWith('image')
      ? 'image'
      : req.file.mimetype === 'application/pdf'
      ? 'pdf'
      : 'document';

    res.json({
      url: result.secure_url,
      fileName: req.file.originalname,
      fileType,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadFile };
