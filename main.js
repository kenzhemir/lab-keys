class ListController {
    constructor(parentElement, listItems) {
        this.listElem = document.createElement("ul");
        this.listElem.classList.add("list");
        this.children = listItems;
        console.log(listItems)
        for (let i = 0; i < listItems.length; i++) {
            this.listElem.append(listItems[i].element);
        }
        parentElement.append(this.listElem);
    }
}

class ListItemController {
    constructor(user, userRef) {
        const el = this.generateElement(user);
        this.element = el.element;
        this.statusElem = el.statusElem;
        userRef.on("value", snapshot => {
            this.statusElem.classList.toggle("active", snapshot.val().active);
        });
    }
    generateElement(user) {
        const element = document.createElement("li");
        const statusElem = document.createElement("div");
        statusElem.classList.add("person__status");
        statusElem.classList.toggle("active", user.active);
        const nameElem = document.createTextNode(`${user.name} ${user.surname}`);
        element.appendChild(statusElem);
        element.appendChild(nameElem);
        return {
            element,
            statusElem
        };
    }
}

function setFirebase() {
    const peopleRef = firebase.database().ref("people");
    peopleRef.once(
        "value",
        snapshot => {
            users = []
            snapshot.val().map((user, index) => {
                users.push(new ListItemController(user, firebase.database().ref(`people/${index}`)));
            });
            new ListController(document.getElementById("listContainer"), users);
        },
        error => {
            console.log(error.code);
        }
    );
}

function buttonHandler(event) {
    const name = document.getElementById("inputName").value;
    firebase.database().ref("people").orderByChild("name").equalTo(name).once("value", snapshot => {
        if (snapshot.val() === null) {
            document.getElementById("errorMessage").classList.add("show");
        } else {
            initializeUser(Object.keys(snapshot.val())[0]);
        }
    })
}

function initializeUser(index) {
    const userRef = firebase.database().ref(`people/${index}`);
    userRef.on("value", snapshot => {
        document.getElementById("name").innerText = snapshot.val().name;
        document.getElementById("toggle").classList.toggle("active", snapshot.val().active);
        document.getElementById("toggle").innerText = (snapshot.val().active ? "Yes" : "No");
        document.getElementById("overlay").classList.add("hidden");
    });
    window.userRef = userRef;
    localStorage.setItem("index", index);
    document.getElementById("signed").classList.remove("hidden");
    document.getElementById("unsigned").classList.add("hidden");

}

function toggleHandler(event) {
    window.userRef.update({
        active: !event.currentTarget.classList.contains("active")
    });
}

function restoreLocalUser() {
    const index = localStorage.getItem("index");
    if (index !== null) {
        return initializeUser(index);
    } else {
        document.getElementById("overlay").classList.add("hidden");
        return false;
    }
}

window.onload = () => {
    setFirebase();
    restoreLocalUser();
    document.getElementById("enterButton").addEventListener('click', buttonHandler);
    document.getElementById("toggle").addEventListener('click', toggleHandler);
};