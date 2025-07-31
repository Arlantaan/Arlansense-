import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

document.getElementById("perfumeForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const imageFile = document.getElementById("image").files[0];

  const imageRef = ref(storage, `perfumes/${imageFile.name}`);
  await uploadBytes(imageRef, imageFile);
  const imageURL = await getDownloadURL(imageRef);

  await addDoc(collection(db, "perfumes"), {
    name,
    price,
    image: imageURL
  });

  document.getElementById("status").textContent = "Uploaded successfully!";
  e.target.reset();
});
