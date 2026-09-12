import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlyftFe8YIWc_SaCqd9A1JWdyRtLNPgtw",
  authDomain: "vestra-capital.firebaseapp.com",
  projectId: "vestra-capital",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data().email, " | role:", doc.data().role);
  });
  process.exit(0);
}
check();
