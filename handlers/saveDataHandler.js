const admin = require('firebase-admin');
const { predict } = require('../handlers/predictHandler'); // Pastikan jalur ini benar

// Save data and predict
const saveData = async (req, res) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];
  const { title, content } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const db = admin.database();
    const ref = db.ref('user_data');
    const newRef = await ref.push({
      uid: uid,
      title: title,
      content: content,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Call the predict endpoint
    req.body.text = content; // Use content for prediction
    await predict(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  saveData,
};
