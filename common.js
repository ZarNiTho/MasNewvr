
// common.js
let currentUser = null;

auth.onAuthStateChanged(user => { 
    if(user) { 
        currentUser = user; 
        db.collection("users").doc(user.uid).set({
            username: user.displayName || user.email.split('@')[0],
            email: user.email,
            lastOnline: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // စာမျက်နှာအလိုက် သီးသန့် Function တွေရှိရင် လှမ်းခေါ်ပါမည်
        if (typeof initPage === 'function') {
            initPage();
        }
    } else { 
        window.location.href = 'login.html'; 
    } 
});

async function logActivity(action, details) {
    try { 
        let uName = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : "Unknown";
        await db.collection("activity_logs").add({ 
            action: `[${uName}] ${action}`, 
            details, 
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            username: uName
        }); 
    } catch (e) { console.error("Log error: ", e); }
}

function logout() {
    Swal.fire({
        title: 'အကောင့်ထွက်မှာလား?', icon: 'question', showCancelButton: true, confirmButtonText: 'ထွက်မည်', cancelButtonText: 'မထွက်ပါ'
    }).then((result) => {
        if (result.isConfirmed) auth.signOut();
    });
}
