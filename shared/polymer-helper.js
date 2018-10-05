export function sharedStyle(name, style) {
    const template = document.createElement('template');
    template.innerHTML = `<dom-module id="${name}">
      <template>
        ${style}
      </template>
    </dom-module>`;
    document.head.appendChild(template.content);
}

export function initialiseFirebase(config) {
    const objectString = JSON.stringify(config);
    const template = document.createElement('template');
    template.innerHTML = `<script src="https://www.gstatic.com/firebasejs/5.3.0/firebase.js"></script>`;
    document.head.appendChild(template.content);
    const template2 = document.createElement('template');
    template2.innerHTML = `<script>
            firebase.initializeApp({
                apiKey: "AIzaSyBN1kmKeYdeKzAsgVXV8yXJg54-UFO7vtk",
                authDomain: "popping-fire-2920.firebaseapp.com",
                databaseURL: "https://popping-fire-2920.firebaseio.com",
                projectId: "popping-fire-2920",
                storageBucket: "popping-fire-2920.appspot.com",
                messagingSenderId: "855037991978"
            });
        </script>`;
    document.head.appendChild(template2.content);
}