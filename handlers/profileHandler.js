const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const upload = multer({ storage: multer.memoryStorage() });

const storage = new Storage({
  projectId: 'equilibrare-425011',
  keyFilename: './service-account.json'
});

const bucketName = 'equilibrare-425011.appspot.com';

const getProfile = async (req, res, next) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const { uid, displayName } = req.body;
  const file = req.file;

  try {
    let photoURL = null;
    if (file) {
      const bucket = storage.bucket(bucketName);
      const fileName = `profile_photos/${uuidv4()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype
        }
      });

      photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const updateData = {
      displayName: displayName
    };

    if (photoURL) {
      updateData.photoURL = photoURL;
    }

    await admin.auth().updateUser(uid, updateData);
    res.status(200).send("Profil pengguna berhasil diperbarui.");
  } catch (error) {
    next(error);
  }
};

// Add middleware to handle file upload
const updateProfileWithPhoto = [upload.single('photo'), updateProfile];

module.exports = {
  getProfile,
  updateProfile: updateProfileWithPhoto
};
