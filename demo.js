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
    history.pushState({key: "userList"}, null, null);
    const $$companyPromise = fetch(`${SERVER_URL}/company/current`, {
        method: 'GET'
        })
    .then(response => {
        return response.json();
        })
    .catch(error => {
        return error;
        });
    
    $$companyPromise
    .then(company => {
        const $$userPromise = fetch(`${SERVER_URL}/company/${company.ID}/users`, {
            method: 'GET'
            })
        .then(response => {
            return response.json();
            })
        .catch(error => {
            return error;
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
                    })
                .catch(error => {
                    return error;
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
                        })
                    .catch(error => {
                        console.log("Something went wrong");
                        });
                    });                       
                });
            })
        .catch(error => {
            console.log("Something went wrong");
            });
        });
}

/**
 * Goes to the Team/View screen.
 *
 * @argument {String} companyName
 * @argument {String} userID
 * @argument {Number} counter
 * @argument {Number} numberOfUser
 * @argument {Boolean} userStatus
 */
function goToViewUserScreen(companyName, userID, counter, numberOfUser, userStatus){
        const $$viewUserButton = document.getElementById(`btn${counter}`);
        $$viewUserButton.addEventListener("click", () => {
            history.pushState({key: "viewUser"}, null, null);
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
            })
            .catch(error => {
                return error;
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
                    })
                .catch(error => {
                    return error;
                    });
                        
                $$userLogsPromise
                .then(logList => {
                    logList.logList.map(log => {
                        var logChild = document.createElement("div");
                        logChild.textContent = log;
                        $$logContainer.appendChild(logChild);
                        });
                    })
                .catch(error => {
                    return error;
                    });
                })
            .catch(error => {
                console.log("Something went wrong");
                });
                
            const $$leftArrow = document.querySelector("#left-arrow");
            $$leftArrow.addEventListener("click", () => {
                removeAllChildren($$userTableHeader);
                removeAllChildren($$userTableBody);
                requestUsers();
                });
        });
}

/**
 * Goes to the Team/Delete screen.
 *
 * @argument {String} fullName
 * @argument {String} position
 * @argument {String} email
 * @argument {String} companyName
 * @argument {Number} numberOfUser
 */
function goToDeleteUserScreen(fullName, position, email, ID, companyName, numberOfUser){
    const $$deleteUserButton = document.querySelector("#delete-user");
    $$deleteUserButton.addEventListener("click", () => {
        var $$cloneWrapperScreenTemplate = document.importNode($$wrapperScreenTemplate.content, true);
        var $$cloneDeleteUserTemplate = document.importNode($$deleteUserTemplate.content, true);
        $$body.appendChild($$cloneWrapperScreenTemplate);
        $$body.appendChild($$cloneDeleteUserTemplate);
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
        }
        });
}

/**
 * Goes to the Team/Edit screen.
 *
 * @argument {String} companyName
 * @argument {String} fullName
 * @argument {String} position
 * @argument {String} email
 * @argument {String} ID
 */
function goToEditUserScreen(companyName, fullName, position, email, ID){
    const $$editUserButton = document.querySelector("#modify-user");
    $$editUserButton.addEventListener("click", () => {
        history.pushState({key: "editUser"}, null, null);
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
            if (JSON.stringify(event.state) == JSON.stringify({key: "viewUser"})){
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
        $$cancelChangeButton.addEventListener("click", (event) => {
            event.preventDefault();
            window.history.back();
            });
        });
}


/**
 * Goes to the Team/Create screen.
 *
 * @argument {String} companyName
 */
function goToCreateUserScreen(companyName){
    const $$plusSignButton = document.querySelector("#add-user");
    
    $$plusSignButton.addEventListener("click", () => {
        window.history.pushState({key: "createUser"}, null, null);
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
            if (JSON.stringify(event.state) == JSON.stringify({key: "userList"})){
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
 * @argument {String} element
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
 * @argument {String} email
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
 * @argument {String} element
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
 * @argument {String} element
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
 * @argument {String} fullNameInputField
 * @argument {String} emailInputField
 * @argument {String} positionInputField
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
 * @argument {String} fullNameInputField
 * @argument {String} emailInputField
 * @argument {String} positionInputField
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
 * @argument {Event} event
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
 * @argument {Event} event
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
 * @argument {Event} event
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
 * @argument {Event} event
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
 * @argument {String} companyName
 * @argument {Number} numberOfUsers
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
 * @argument {String} status
 * @argument {String} fullName
 * @argument {String} email
 * @argument {Number} counter
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
 * @argument {HTMLElement} element
 */
function removeAllChildren(element){
    while (element.firstChild){
        element.removeChild(element.firstChild);
    }
}

requestUsers();