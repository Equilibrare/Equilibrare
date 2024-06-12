const axios = require('axios');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const upload = multer({ storage: multer.memoryStorage() });

const storage = new Storage({
  projectId: 'equilibrare-425011',
  keyFilename: './service-accounts.json'
});

const bucketName = 'equilibrare-425011.appspot.com';

const signup = async (req, res, next) => {
  const { email, password, displayName } = req.body;
  const file = req.file;

  try {
    // Upload the profile photo to GCS
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

    // Create user with photoURL
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      photoURL: photoURL
    });

    res.json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

// Add middleware to handle file upload
const signupWithPhoto = [upload.single('photo'), signup];

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
      email: email,
      password: password,
      returnSecureToken: true
    });
    const idToken = response.data.idToken;
    const refreshToken = response.data.refreshToken; // Dapatkan refreshToken
    res.json({ idToken, refreshToken }); // Kirim keduanya ke klien
  } catch (error) {
    next(error);
  }
};


const googleLogin = async (req, res, next) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ idToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup: signupWithPhoto,
  login,
  googleLogin,
  logout
};
