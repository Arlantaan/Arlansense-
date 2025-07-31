// Firebase config (use your provided config)
const firebaseConfig = {
  apiKey: "AIzaSyAXfFinXJJf8QjV37tuuOa_8cYzg0Cn3Q4",
  authDomain: "sensation-by-sanu.firebaseapp.com",
  projectId: "sensation-by-sanu",
  storageBucket: "sensation-by-sanu.appspot.com",
  messagingSenderId: "985250517980",
  appId: "1:985250517980:web:05011bfb5877ff7c193519",
  measurementId: "G-VHH6P2L106"
};

// Prevent double initialization
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const storage = firebase.storage();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('perfumeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const imageFile = document.getElementById('image').files[0];
    const status = document.getElementById('status');
    const spinner = document.getElementById('uploadSpinner');

    if (!imageFile) {
      status.textContent = "Please select an image.";
      return;
    }

    spinner.style.display = 'block';
    status.textContent = '';
    // Upload image to Firebase Storage
    const storageRef = storage.ref('perfumes/' + imageFile.name);
    try {
      await storageRef.put(imageFile);
      const imageUrl = await storageRef.getDownloadURL();

      // Save perfume info to Firestore
      await db.collection('perfumes').add({
        name,
        price,
        imageUrl,
        created: firebase.firestore.FieldValue.serverTimestamp()
      });

      status.textContent = "Perfume uploaded successfully!";
      document.getElementById('perfumeForm').reset();
    } catch (err) {
      status.textContent = "Error: " + err.message;
    } finally {
      spinner.style.display = 'none';
    }
  });
});
