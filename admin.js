// IMPORTANT: You must paste your Firebase config object here as well.
const firebaseConfig = {
    apiKey: "AIzaSyB8aZDvHthUikdoJr2n-_QCXN3P3Ae0q-0",
  authDomain: "mychatty-95cdf.firebaseapp.com",
  databaseURL: "https://mychatty-95cdf-default-rtdb.firebaseio.com",
  projectId: "mychatty-95cdf",
  storageBucket: "mychatty-95cdf.firebasestorage.app",
  messagingSenderId: "356880043016",
  appId: "1:356880043016:web:2b8fffea05f0c5c8bb95bd",
  measurementId: "G-SDQ4YS5F3J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const tableBody = document.getElementById('rsvp-table-body');
const loadingState = document.getElementById('loading-state');

// Listen for real-time updates from the 'rsvp' collection
db.collection('rsvp').orderBy('time', 'desc').onSnapshot(snapshot => {
    // Clear the existing table data
    tableBody.innerHTML = '';

    if (snapshot.empty) {
        loadingState.textContent = 'No RSVPs received yet.';
        return;
    }

    loadingState.style.display = 'none';
    let count = 1;

    snapshot.forEach(doc => {
        const rsvp = doc.data();

        const row = document.createElement('tr');

        // Format the timestamp for readability
        const timestamp = rsvp.time ? new Date(rsvp.time.seconds * 1000).toLocaleString() : 'N/A';

        row.innerHTML = `
            <td>${count}</td>
            <td>${rsvp.name || 'N/A'}</td>
            <td>${rsvp.phone || 'N/A'}</td>
            <td>${rsvp.songRequest || 'None'}</td>
            <td>${rsvp.msg || 'None'}</td>
            <td>${timestamp}</td>
        `;

        tableBody.appendChild(row);
        count++;
    });

}, err => {
    console.error("Error fetching RSVP data: ", err);
    loadingState.textContent = 'Error loading data. Check console for details.';
});