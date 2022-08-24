function StudioState () {
    this.state = "Undefined";
    this.duration = null;

    this.init = () => {
        getStudioState().then(response => {
            this.state = response?.state;
            this.duration = response?.duration;
            this.render();
        })
    }

    this.render = () => {
        changeStateIndicator(this.state.toLowerCase());

        switch (this.state) {
            case "Undefined":
                changeStateText("Пока новостей нет");
                break;
            case "Closed":
                changeStateText("Сегодня студия закрыта<br />:(");
                break;
            case "Opened":
                changeStateText(Login.authorized
                    ? `<span>С <input type='text' id="time-from" name="time-from" value=${this.duration.from} 
                    pattern="^([01][0-9]|2[0-3]):([0-5][0-9])$" /> 
                    До <input type='text' id="time-to" name="time-to" value=${this.duration.to} 
                    pattern="^([01][0-9]|2[0-3]):([0-5][0-9])$" /></span>
                    <input type="button" value="Сохранить" onclick="changeDurationTime()" />`
                    : `Сегодня можно прийти<br />С
                    ${this.duration ? this.duration.from : ""} до 
                    ${this.duration ? this.duration.to : ""}`);

                if (this.state === 'Opened' && Login.authorized) {
                    document.getElementById('time-from')
                        .addEventListener(
                            'change',
                            (event) => this.setTimeFrom(event.target.value)
                        );

                    document.getElementById('time-to')
                        .addEventListener(
                            'change',
                            (event) => this.setTimeTo(event.target.value)
                        );
                }
                break;
            default:
                changeStateText("Негр.");
                break;
        }
    }

    this.setTimeFrom = (value) => {
        this.duration = {...this.duration, from: value};
        this.renderTimeInput('from');
    }

    this.setTimeTo = (value) => {
        this.duration = { ...this.duration, to: value};
        this.renderTimeInput('to');
    }

    this.renderTimeInput = (field) => {
        if (this.state === 'Opened' && Login.authorized) {
            const element = document.getElementById(`time-${field}`);
            element.value = field === 'from' ? this.duration.from : this.duration.to;
        }
    }

    this.changeState = () => {
        changeStudioState(
        this.state === "Undefined"
            ? "Opened"
            : this.state === "Opened"
                ? "Closed"
                : "Opened")
            .then(response => {
                this.state = response?.state;
                this.duration = response?.duration;
                this.render();
            })
    }
}

function LoginState () {
    this.username = "Pizdec";
    this.password = "Nahui";
    this.authorized = false;
    this.loginBtn = null;

    this.init = () => {
        this.authorized = localStorage.getItem('SuspiciousElement');
        this.authorized ? this.authorize() : this.unauthorize();

        setAuthorizedBtn(this.authorized);

        this.loginBtn = document.querySelector('input.login-btn');
        this.renderFields('username');
        this.renderFields('password');
    }

    this.renderFields = (field) => {
        const fieldElement = document.getElementById(`login-${field}`);
        fieldElement.value = field === 'username' ? this.username : this.password;
    }

    this.showInvalidDataMsg = () => {
        this.loginBtn.classList.add('error-msg');
        this.username = "";
        this.password = "";
    }

    this.setUsername = (username) => {
        this.username = username;
        this.renderFields('username');
    }

    this.setPassword = (password) => {
        this.password = password;
        this.renderFields('password');
    }

    this.login = () => {
        this.loginBtn.classList.remove('error-msg');
        loginUser(this.username, this.password).then(response => {
            if (response.status === 200) {
                this.authorized = true;
                this.authorize();

                pageUp();
                localStorage.setItem("SuspiciousElement", "AnythingAsLongAsItIsNotEmpty");
                return;
            }
            if (response.status === 401) {
                this.showInvalidDataMsg();
                return;
            }
            alert('Something went wrong!');
        });
    }

    this.logout = () => {
        this.authorized = false;
        this.unauthorize();
        localStorage.removeItem('SuspiciousElement');
    }

    this.authorize = () => {
        //Должны быть методы, которые отрисовывают страницу, когда пользователь авторизован
        Studio.render();

        addManageState();
        setAuthorizedBtn(this.authorized);
        // pageUp();
    }

    this.unauthorize = () => {
        //Методы, которые отрисовывают страницу неавторизованного пользователя
        Studio.render();

        removeManageState();
        setAuthorizedBtn(this.authorized);
    }
}

const Studio = new StudioState();
const Login = new LoginState();
const csrftoken = getCookie('csrftoken');

/** Забирает данный о состоянии студии на сегодняшний день */
const getStudioState = async () => {
    return fetch("/app/state/", {
        method: "GET",
        headers: {
            "X-CSRFToken": csrftoken,
            'Content-Type': "application/json",
        }
    }).then((response) => {
        if (response.ok) return response.json();
        return Promise.reject(response)
    }).catch(err => console.log(err));
}

const changeStudioState = async (state) => {
    return fetch("/app/state/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            'Content-Type': "application/json",
        },
        body: JSON.stringify( {
            state: state
        }),
    }).then((response) => {
        if (response.ok) return response.json();
        Login.logout();
        return Promise.reject(response);
    }).catch(err => console.log(err));
}

const changeStudioDuration = async (time_from, time_to) => {
    return fetch("/app/state/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            'Content-Type': "application/json",
        },
        body: JSON.stringify( {
            time_from: time_from,
            time_to: time_to
        }),
    }).then((response) => {
        if (response.ok) return response.json();
        Login.logout();
        return Promise.reject(response);
    }).catch(err => console.log(err));
}

/** Авторизация пользователя по введённым данным */
const loginUser = async () => {
    const csrftoken = getCookie('csrftoken');
    return fetch('/app/login/', {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            'Content-Type': "application/json",
        },
        body: JSON.stringify({
            'username': Login.username,
            'password': Login.password
        })
    })
}

/**
    Функция для получения кукесов.
    Она нужна для того, чтобы получить токен пользователя, который хранится в cookie.
    Токен пользователя, в свою очередь, нужен для того, чтобы система распознала, что запросы защищены.
    Без него POST и PUT запросы выполняться не будут, потому что так захотел Django.
*/
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/** Страница логина "спускается" вниз */
const pageDown = () => {
    const classList_ = document.getElementById('login-part').classList;

    classList_.remove('page-up-animation');
    classList_.add('page-down-animation');
}

/** Страница логина "поднимается" наверх */
const pageUp = () => {
    const classList_ = document.getElementById('login-part').classList;

    classList_.remove('page-down-animation');
    classList_.add('page-up-animation');
}

const loginBtnElement = () => {
    const element =  document.createElement('input')
    element.value = 'Войти';
    element.type = 'button'
    element.onclick = pageDown;

    return element;
}

const logoutBtnElement = () => {
    const element =  document.createElement('input')
    element.value = 'Выйти';
    element.type = 'button'
    element.onclick = Login.logout;

    return element;
}

const setAuthorizedBtn = (authorized) => {
    const element = document.querySelector('.main-btn-wrapper');

    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }

    element.insertAdjacentElement(
        'afterbegin',
        authorized ? logoutBtnElement() : loginBtnElement()
    );
}

const changeStateIndicator = (state) => {
     const stateIndicator = document.getElementById('studio-state').querySelector('.state-indicator');

    ['undefined', 'opened', 'closed'].forEach(
        (class_) => {
            if (stateIndicator.classList.contains(class_))
                stateIndicator.classList.remove(class_);
        }
    );

    stateIndicator.classList.add(state);
}

const addManageState = () => {
    const stateIndicator = document.getElementById('studio-state').querySelector('.state-indicator');

    if (!stateIndicator.classList.contains('state-manage')) {
        stateIndicator.classList.add('state-manage');
        stateIndicator.addEventListener('click', Studio.changeState);
    }
}

const removeManageState = () => {
    const stateIndicator = document.getElementById('studio-state').querySelector('.state-indicator');

    if (stateIndicator.classList.contains('state-manage')) {
        stateIndicator.classList.remove('state-manage');
        stateIndicator.removeEventListener('click', Studio.changeState);
    }
}

const changeStateText = (text) => {
    document.getElementById('studio-state').querySelector('.state-text').innerHTML = text;
}

const temporaryWebSocketReplacement = () => setInterval(() => {
    Studio.init();
}, 1000 * 60 * 10)

const changeDurationTime = () => {
    if (document.querySelector('input#time-to')?.validity?.valid &&
        document.querySelector('input#time-from')?.validity?.valid) {
        changeStudioDuration(Studio.duration?.from, Studio.duration?.to).then(response => {
            if (response?.duration?.from)
                Studio.setTimeFrom(response.duration.from);
            if (response?.duration?.to)
                Studio.setTimeTo(response.duration.to);
        })
    } else {
        alert('Invalid time input')
    }
}

window.onload = function () {
    Studio.init();
    Login.init();

    temporaryWebSocketReplacement();

    document
        .getElementById('login-username')
        .addEventListener(
            'change',
            (event) => Login.setUsername(event.target.value)
        )

    document
        .getElementById('login-password')
        .addEventListener(
            'change',
            (event) => Login.setPassword(event.target.value)
        )
}