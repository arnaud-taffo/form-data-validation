const $$userTableHeader = document.querySelector("#user-table-header");
const $$userTableBody = document.querySelector("#user-table-body");
const $$userListTemplateHeader = document.querySelector("#user-list-template-header");
const $$userListTemplateBody = document.querySelector("#user-list-template-body");
const $$createUserTemplateHeader = document.querySelector("#create-user-template-header");
const $$createUserTemplateBody = document.querySelector("#create-user-template-body");
const $$viewUserTemplateHeader = document.querySelector("#view-user-template-header");
const $$viewUserTemplateBody = document.querySelector("#view-user-template-body");
const $$wrapperScreenTemplate = document.querySelector("#wrapper-screen-template");
const $$deleteUserTemplate = document.querySelector("#delete-user-template");
const $$body = document.body;
const SERVER_URL = "http://127.0.0.1:9090";
var counter = 0;

/**
 * Requests the users list to the server.
 */
function requestUsers(){
    const $$companyPromise = fetch(`${SERVER_URL}/company/current`, {
        method: 'GET'
        })
    .then(response => {
        return response.json();
        });
    
    $$companyPromise
    .then(company => {
        const $$userPromise = fetch(`${SERVER_URL}/company/${company.ID}/users`, {
            method: 'GET'
            })
        .then(response => {
            return response.json();
            });
            
        $$userPromise
        .then(userArray => {
            populateUserListHeader(company.name, userArray.length);
            goToCreateUserScreen(company.name);
            userArray.map(user => {
                const $$userStatusPromise = fetch(`${SERVER_URL}/user/${user.ID}/status`, {
                    method: 'GET'
                    })
                .then(response => {
                    return response.json();
                    });
                        
                $$userStatusPromise
                .then(response => {
                    populateUserListBody(response.status, user.fullName, user.email, counter);
                    
                    Promise.all([$$companyPromise, $$userPromise, $$userStatusPromise])
                    .then(([company, userList, userStatus]) => {
                        const uniqueUser = userList.reduce((accumulator, currentUser) => {
                            if (currentUser.ID === userStatus.ID){
                                accumulator[userStatus.ID] = currentUser;
                            }
                            return accumulator;
                            }, {});

                        goToViewUserScreen(company.name, uniqueUser[user.ID].ID, counter, userArray.length, userStatus.status);
                        counter++;
                        });
                    });                       
                });
            });
        });
}

/**
 * Goes to the Team/View screen.
 *
 * @argument companyName {String}
 * @argument userID {String}
 * @argument counter {Number}
 * @argument numberOfUser {Number}
 * @argument userStatus {Boolean}
 */
function goToViewUserScreen(companyName, userID, counter, numberOfUser, userStatus){
        const $$viewUserButton = document.getElementById(`btn${counter}`);
        $$viewUserButton.addEventListener("click", () => {
            history.pushState({key: "viewUser"}, "titre", null);
            var tmpHeaderUpWrapper = [...$$userTableHeader.children][0];
            var tmpHeaderLowWrapper = [...$$userTableHeader.children][1];
            var tmpBody = [...$$userTableBody.children];
            removeAllChildren($$userTableHeader);
            removeAllChildren($$userTableBody);
            var $$cloneViewUserTemplateHeader = document.importNode($$viewUserTemplateHeader.content, true);
            var $$cloneViewUserTemplateBody = document.importNode($$viewUserTemplateBody.content, true);
            $$userTableHeader.appendChild($$cloneViewUserTemplateHeader);
            $$userTableBody.appendChild($$cloneViewUserTemplateBody);
            const $$companyName = document.querySelector(".company-name");
            const $$fullName = document.querySelector(".header-title");
            const $$positionAndEmail = document.querySelector(".template-first-child");
            const $$userStatus = document.querySelector(".template-second-child");
            const $$logContainer = document.querySelector(".log-container");
            
            const $$getUserInfoPromise = fetch(`${SERVER_URL}/user/${userID}`, {
                method: 'GET'
                })
            .then(response => {
                return response.json();
            });
            
            $$getUserInfoPromise
            .then(user => {
                $$companyName.textContent = companyName;
                $$fullName.textContent = user.fullName;
                $$positionAndEmail.innerHTML = `<div>${user.position}</div>
                                                <div>${user.email}</div>`;
                
                goToEditUserScreen(companyName, user.fullName, user.position, user.email, user.ID);
                goToDeleteUserScreen(user.fullName, user.position, user.email, user.ID, companyName, numberOfUser);

                if (userStatus){
                   $$userStatus.innerHTML = `<div style="background-color: #11ee11"></div>
                                            <div>Active</div>`; 
                }
                else{
                    $$userStatus.innerHTML = `<div style="background-color: #ff3399"></div>
                                            <div>Inactive</div>`;
                }
                
                const $$userLogsPromise = fetch(`${SERVER_URL}/user/${user.ID}/logs`, {
                    method: 'GET'
                    })
                .then(response =>  {
                    return response.json();
                    });
                
                $$userLogsPromise
                .then(logList => {
                    logList.logList.map(log => {
                        var logChild = document.createElement("div");
                        logChild.textContent = log;
                        $$logContainer.appendChild(logChild);
                        });
                    });
                });
               
            window.onpopstate = function(event){
                if (event.state == null){
                    removeAllChildren($$userTableHeader);
                    removeAllChildren($$userTableBody);
                    $$userTableHeader.appendChild(tmpHeaderUpWrapper);
                    $$userTableHeader.appendChild(tmpHeaderLowWrapper);
                    tmpBody.forEach(child => {
                        $$userTableBody.appendChild(child);
                        });
                    }
                };
                
            const $$leftArrow = document.querySelector("#left-arrow");
            $$leftArrow.addEventListener("click", () => {
                window.history.back();
                });
        });
}

/**
 * Goes to the Team/Delete screen.
 *
 * @argument fullName {String}
 * @argument position {String}
 * @argument email {String}
 * @argument companyName {String}
 * @argument numberOfUser {Number}
 */
function goToDeleteUserScreen(fullName, position, email, ID, companyName, numberOfUser){
    const $$deleteUserButton = document.querySelector("#delete-user");
    $$deleteUserButton.addEventListener("click", () => {
        var $$cloneWrapperScreenTemplate = document.importNode($$wrapperScreenTemplate.content, true);
        var $$cloneDeleteUserTemplate = document.importNode($$deleteUserTemplate.content, true);
        $$body.appendChild($$cloneWrapperScreenTemplate);
        $$body.appendChild($$cloneDeleteUserTemplate);
        const $$userTableHeaderUpperWrapper = document.querySelector("#upper-wrapper");
        const $$leftArrow = document.querySelector("#left-arrow");
        $$userTableHeaderUpperWrapper.removeChild($$leftArrow);
        const $$fullName = document.querySelector("#delete-title");
        const $$deleteUserButton = document.querySelector("#delete-button");
        const $$cancelButton = document.querySelector(".cancel-button");
        const $$crossButton = document.querySelector("#cross-button");
        const $$wrapperScreen = document.querySelector("#wrapper-screen");
        const $$deleteUserBodyContainer = document.querySelector(".delete-user-body-container");
        
        $$fullName.textContent = `Delete ${fullName}`;
        $$deleteUserButton.addEventListener("click", () => {
            
            var requestBody = {
                email: email,
                fullName: fullName,
                position: position
                };
            var requestHeader = new Headers();
            requestHeader.append("Content-Type", "application/json");
            
            $$deleteUserPromise = fetch(`${SERVER_URL}/user/${ID}`, {
                method: 'DELETE',
                headers: requestHeader,
                body: JSON.stringify(requestBody)
                });
            numberOfUser--;
            $$body.removeChild($$wrapperScreen);
            $$body.removeChild($$deleteUserBodyContainer);
            removeAllChildren($$userTableHeader);
            removeAllChildren($$userTableBody);
            requestUsers();
            });
        
        $$crossButton.addEventListener("click", handleEventCancelUserDeletion);
        $$cancelButton.addEventListener("click", handleEventCancelUserDeletion);
        
        function handleEventCancelUserDeletion(){
            $$body.removeChild($$wrapperScreen);
            $$body.removeChild($$deleteUserBodyContainer);
            const $$leftArrow = document.createElement("div");
            $$leftArrow.id = "left-arrow";
            $$leftArrow.classList.add("svg-bubble");
            $$leftArrow.innerHTML = `
                <svg width="20px" height="20px" viewBox="0 0 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <title> Icons / Arrows / Arrow left</title>
                    <desc>Created with Sketch.</desc>
                    <defs>
                        <path d="M11,7 L5.705,12.0020243 C5.33718283,12.3494899 5.32068463,12.9293412 5.66815025,13.2971583 C5.68008159,13.3097885 5.69236982,13.3220767 5.705,13.3340081 L5.72403849,13.3519932 C6.10914965,13.7157959 6.71115958,13.7161236 7.09666658,13.3527403 L11,9.6734143 L14.9033334,13.3527403 C15.2888404,13.7161236 15.8908504,13.7157959 16.2759615,13.3519932 L16.295,13.3340081 C16.6628172,12.9865425 16.6793154,12.4066912 16.3318498,12.038874 C16.3199184,12.0262439 16.3076302,12.0139556 16.295,12.0020243 L11,7 Z" id="path-1"></path>
                    </defs>
                    <g id="-Icons-/-Arrows-/-Arrow-left" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <mask id="mask-2" fill="white">
                            <use xlink:href="#path-1"></use>
                        </mask>
                        <use id="Shape" fill="#475F7B" transform="translate(11.050000, 10.735875) rotate(-90.000000) translate(-11.050000, -10.735875) " xlink:href="#path-1"></use>
                    </g>
                </svg>`;
            $$userTableHeaderUpperWrapper.insertBefore($$leftArrow, $$userTableHeaderUpperWrapper.childNodes[0]);
            $$leftArrow.addEventListener("click", () => {
                removeAllChildren($$userTableHeader);
                removeAllChildren($$userTableBody);
                requestUsers();
                });
        }
        });
}

/**
 * Goes to the Team/Edit screen.
 *
 * @argument companyName {String}
 * @argument fullName {String}
 * @argument position {String}
 * @argument email {String}
 * @argument ID {String}
 */
function goToEditUserScreen(companyName, fullName, position, email, ID){
    const $$editUserButton = document.querySelector("#modify-user");
    $$editUserButton.addEventListener("click", () => {
        history.pushState({key: "editUser"}, "titre", null);
        var tmpHeaderUpWrapper = [...$$userTableHeader.children][0];
        var tmpHeaderLowWrapper = [...$$userTableHeader.children][1];
        var tmpBody = [...$$userTableBody.children];  
        removeAllChildren($$userTableHeader);
        removeAllChildren($$userTableBody);
        var $$cloneEditUserTemplateHeader = document.importNode($$createUserTemplateHeader.content, true);
        var $$cloneEditUserTemplateBody = document.importNode($$createUserTemplateBody.content, true);
        $$userTableHeader.appendChild($$cloneEditUserTemplateHeader);
        $$userTableBody.appendChild($$cloneEditUserTemplateBody);
        const $$companyName = document.querySelector(".company-name");
        const $$fullName = document.querySelector(".header-title");
        
        const $$fullNameInputField = document.querySelector("#fullname");
        const $$emailInputField = document.querySelector("#email");
        const $$positionInputField = document.querySelector("#position");       
        $$fullNameInputField.addEventListener("change", fullNameValueChanged);
        $$emailInputField.addEventListener("change", emailValueChanged);
        $$positionInputField.addEventListener("change", positionValueChanged);
        
        $$companyName.textContent = companyName;
        $$fullName.textContent = fullName;
        $$fullNameInputField.value = fullName;
        $$emailInputField.value = email;
        $$positionInputField.value = position;
        
        const $$saveChangeButton = document.querySelector("#create-button");
        $$saveChangeButton.textContent = "Save";
        $$saveChangeButton.addEventListener("click", (event) => {
            if (checkInputFieldsNotEmpty($$fullNameInputField, $$emailInputField, $$positionInputField) && checkInputFieldsValidFormat($$fullNameInputField.value.trim(), $$emailInputField.value.trim(), $$positionInputField.value.trim())){
                var requestBody = {
                    email: $$emailInputField.value,
                    fullName: $$fullNameInputField.value,
                    position: $$positionInputField.value
                    };
                var requestHeader = new Headers();
                requestHeader.append("Content-Type", "application/json");
                    
                const $$sendUserEditedPromise = fetch(`${SERVER_URL}/user/${ID}`, {
                    method: 'PUT',
                    headers: requestHeader,
                    body: JSON.stringify(requestBody)
                    });
                    
                $$sendUserEditedPromise
                .then(response => {
                    return response.json();
                    });
            }
            else{
                event.preventDefault();
            }
            });
    
        window.onpopstate = function(event){
            if (event.state == null){
                removeAllChildren($$userTableHeader);
                removeAllChildren($$userTableBody);
                $$userTableHeader.appendChild(tmpHeaderUpWrapper);
                $$userTableHeader.appendChild(tmpHeaderLowWrapper);
                tmpBody.forEach(child => {
                    $$userTableBody.appendChild(child);
                });
            }
        };
        
        const $$cancelChangeButton = document.querySelector(".cancel-button");
        $$cancelChangeButton.addEventListener("click", () => {
            window.history.back();
            });
        });
}


/**
 * Goes to the Team/Create screen.
 *
 * @argument companyName {String}
 */
function goToCreateUserScreen(companyName){
    const $$plusSignButton = document.querySelector("#add-user");
    
    $$plusSignButton.addEventListener("click", () => {
        window.history.pushState({key: 'createUser'}, 'titre', null);
        var tmpHeaderUpWrapper = [...$$userTableHeader.children][0];
        var tmpHeaderLowWrapper = [...$$userTableHeader.children][1];
        var tmpBody = [...$$userTableBody.children];
        removeAllChildren($$userTableHeader);
        removeAllChildren($$userTableBody);
        var $$cloneCreateUserTemplateHeader = document.importNode($$createUserTemplateHeader.content, true);
        var $$cloneCreateUserTemplateBody = document.importNode($$createUserTemplateBody.content, true);
        $$userTableHeader.appendChild($$cloneCreateUserTemplateHeader);
        $$userTableBody.appendChild($$cloneCreateUserTemplateBody);
        const $$companyName = document.querySelector(".company-name");
        $$companyName.textContent = companyName;
        bindFormInputFields();
        bindCreateUserScreenButtons();

        window.onpopstate = function(event){
            if (event.state == null){
                removeAllChildren($$userTableHeader);
                removeAllChildren($$userTableBody);
                $$userTableHeader.appendChild(tmpHeaderUpWrapper);
                $$userTableHeader.appendChild(tmpHeaderLowWrapper);
                tmpBody.forEach(child => {
                    $$userTableBody.appendChild(child);
                });
            }
        };
    });    
}

/**
 * Binds the form input fields to a change event.
 */
function bindFormInputFields(){
    const $$fullNameInputField = document.querySelector("#fullname");
    const $$emailInputField = document.querySelector("#email");
    const $$positionInputField = document.querySelector("#position");
    $$fullNameInputField.addEventListener("change", fullNameValueChanged);
    $$emailInputField.addEventListener("change", emailValueChanged);
    $$positionInputField.addEventListener("change", positionValueChanged);
}

/**
 * Binds the buttons of the Team/Create screen to a click event.
 */
function bindCreateUserScreenButtons(){
    const $$createButton = document.querySelector("#create-button");
    const $$cancelButton = document.querySelector(".cancel-button");
    $$createButton.addEventListener("click", handleEventCreateUser);
    $$cancelButton.addEventListener("click", () => {
        window.history.back();
        });
}

/**
 * Checks that the element has a valid format.
 *
 * @argument element {String}
 */
function formatIsValid(element){
    var validFormat = true;
    const regex = /^.*?@.*?$/;
    const test = regex.test(element);
    if (numberOfWhiteSpace(element) > 0 || !test || isUncomplete(element)){
        validFormat = false;
    }
    
    return validFormat;
}

/**
 * Checks that the email has a valid format.
 *
 * @argument email {String}
 */
function isUncomplete(email){
    var isUncomplete = false;
    
    if (email.indexOf("@") == 0 || email.indexOf("@") == email.length - 1){
        isUncomplete = true;
    }
    
    return isUncomplete;
}

/**
 * Counts the number of white spaces.
 *
 * @argument element {String}
 */
function numberOfWhiteSpace(element){
    var count = 0;
    for (let i = 0; i < element.length; i++){
        if (element[i] === " "){
            count++;
        }
    }
    return count;
}

/**
 * Checks if there are several successive white spaces.
 *
 * @argument element {String}
 */
function severalSuccessiveWhiteSpaces(element){
    var severalSuccessiveWhiteSpaces = false;
    for (let i = 0; i < element.length; i++){
        for (let j = i + 1; j < i + 2; j++){
            if (element[i] === element[j] && element[i] === " "){
                severalSuccessiveWhiteSpaces = true;
            }
        }
    }
    
    return severalSuccessiveWhiteSpaces;
}

/**
 * Checks that fields are not empty.
 *
 * @argument fullNameInputField {String}
 * @argument emailInputField {String}
 * @argument positionInputField {String}
 */
function checkInputFieldsNotEmpty(fullNameInputField, emailInputField, positionInputField){
    var allFieldsNotEmpty = true;
    
    if (fullNameInputField.validity.valueMissing){
        fullNameInputField.style.borderColor = "#ff3399";
        allFieldsNotEmpty = false;
    }
    if (emailInputField.validity.valueMissing){
        emailInputField.style.borderColor = "#ff3399";
        allFieldsNotEmpty = false;
    }
    if (positionInputField.validity.valueMissing){
        positionInputField.style.borderColor = "#ff3399";
        allFieldsNotEmpty = false;
    }
    
    return allFieldsNotEmpty;
}

/**
 * Checks that fields have a valid format.
 *
 * @argument fullNameInputField {String}
 * @argument emailInputField {String}
 * @argument positionInputField {String}
 */
function checkInputFieldsValidFormat(fullNameInputField, emailInputField, positionInputField){
    var formatsAreValid = true;
    
    if(numberOfWhiteSpace(fullNameInputField) === 0 || severalSuccessiveWhiteSpaces(fullNameInputField)){
        formatsAreValid = false;
    }
    
    if(!formatIsValid(emailInputField) || numberOfWhiteSpace(emailInputField) > 0){
        formatsAreValid = false;
    }
    
    if(severalSuccessiveWhiteSpaces(positionInputField)){
        formatsAreValid = false;
    }
    return formatsAreValid;      
}

/**
 * Changes the border color of the field if not valid.
 *
 * @argument event {Event}
 */
function emailValueChanged(event){
    if (numberOfWhiteSpace(event.target.value.trim()) > 0 || !formatIsValid(event.target.value.trim())){
        event.target.style.borderColor = "#ff3399";
    }
    else{
        event.target.style.borderColor = "#e1e5e8";
    }
}

/**
 * Changes the border color of the field if not valid.
 *
 * @argument event {Event}
 */
function fullNameValueChanged(event){
    if (numberOfWhiteSpace(event.target.value.trim()) === 0 || severalSuccessiveWhiteSpaces(event.target.value.trim())){
        event.target.style.borderColor = "#ff3399";
    }
    else{
        event.target.style.borderColor = "#e1e5e8";
    }
}

/**
 * Changes the border color of the field if not valid.
 *
 * @argument event {Event}
 */
function positionValueChanged(event){
    if (severalSuccessiveWhiteSpaces(event.target.value.trim())){
        event.target.style.borderColor = "#ff3399";
    }
    else{
        event.target.style.borderColor = "#e1e5e8";
    }
}

/**
 * Handles a user's creation.
 *
 * @argument event {Event}
 */
function handleEventCreateUser(event){
    const $$fullNameInputField = document.querySelector("#fullname");
    const $$emailInputField = document.querySelector("#email");
    const $$positionInputField = document.querySelector("#position");
    if (checkInputFieldsNotEmpty($$fullNameInputField, $$emailInputField, $$positionInputField) && checkInputFieldsValidFormat($$fullNameInputField.value.trim(), $$emailInputField.value.trim(), $$positionInputField.value.trim())){
        var requestBody = {
            email: $$emailInputField.value,
            fullName: $$fullNameInputField.value,
            position: $$positionInputField.value
            };
        var requestHeader = new Headers();
        requestHeader.append("Content-Type", "application/json");
        fetch(`${SERVER_URL}/user`, {
            method: 'POST',
            headers: requestHeader,
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            return response.json();
        });
    }
    else{
        event.preventDefault();
    }
}

/**
 * Populates the header of the user list.
 *
 * @argument companyName {String}
 * @argument numberOfUsers {Number}
 */
function populateUserListHeader(companyName, numberOfUsers){  
    var $$clone = document.importNode($$userListTemplateHeader.content, true);
    $$userTableHeader.appendChild($$clone);
    const $$companyName = document.querySelector('.company-name');
    const $$numberOfUser = document.querySelector('#number-of-user');
    $$companyName.textContent = companyName;
    $$numberOfUser.textContent = `${numberOfUsers} members`;
}

/**
 * Populates the body of the user list.
 *
 * @argument status {String}
 * @argument fullName {String}
 * @argument email {String}
 * @argument counter {Number}
 */
function populateUserListBody(status, fullName, email, counter){
    var $$clone = document.importNode($$userListTemplateBody.content, true);
    var $$userInfoElement = $$clone.querySelectorAll(".body-container > div");
    $$userInfoElement[0].innerHTML = `<div>${fullName}</div>
                                    <div>${email}</div>`;
    if (status){
        $$userInfoElement[1].innerHTML = `<div style="background-color: #11ee11"></div>
                                        <div>Active</div>`;
    }
    else{
        $$userInfoElement[1].innerHTML = `<div style="background-color: #ff3399"></div>
                                        <div>Inactive</div>`;
    }
                    
    $$userInfoElement[2].innerHTML  = `<button id="btn${counter}" class="view-button">View</button>`;
    
    $$userTableBody.appendChild($$clone);
}

/**
 * Removes the children from an element of the DOM.
 *
 * @argument element {HTMLElement}
 */
function removeAllChildren(element){
    while (element.firstChild){
        element.removeChild(element.firstChild);
    }
}

requestUsers();