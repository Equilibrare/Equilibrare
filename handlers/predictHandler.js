const { spawn } = require('child_process');
const admin = require('firebase-admin');

// Predict function
const predict = async (req, res) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];
  const { text } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const process = spawn('python3', ['preprocessing.py', text]);

    let result = '';
    let error = '';

    process.stdout.on('data', (data) => {
      result += data.toString();
    });

    process.stderr.on('data', (data) => {
      // Log stderr data for debugging
      console.error(`stderr: ${data}`);
    });

    process.on('close', async (code) => {
      console.log(`Python process exited with code ${code}`);
      try {
        const lines = result.trim().split('\n');
        const jsonLine = lines.find(line => {
          try {
            JSON.parse(line);
            return true;
          } catch {
            return false;
          }
        });
        
        if (!jsonLine) {
          throw new Error('No JSON output found in Python script output');
        }

        const predictionResult = JSON.parse(jsonLine);
        const { prediction_result, result: label } = predictionResult;

        const db = admin.firestore();
        await db.collection('predictions').add({
          uid: uid,
          text: text,
          prediction: prediction_result,
          label: label,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ prediction: prediction_result, label: label });
      } catch (error) {
        console.error('Error parsing JSON from predict script:', error);
        res.status(500).send({ error: error.message });
      }
    });

    process.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      res.status(500).send({ error: err.message });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

// Get histories
const getHistories = async (req, res) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const db = admin.firestore();
    const querySnapshot = await db.collection('predictions').where('uid', '==', uid).orderBy('timestamp', 'desc').limit(10).get();

    const histories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(histories);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  predict,
  getHistories,
};
