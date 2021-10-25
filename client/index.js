let url = 'http://127.0.0.1:3000/'
let data = {}

function seeIfLoggedIn() {
  if (window.localStorage.getItem('token'))
    document.getElementById('logout').style.display = "block";
}
seeIfLoggedIn()

document.getElementById("logout").addEventListener('click', function () {
  localStorage.clear();
  document.getElementById('logout').style.display = "none";
})


let globalRequestParameters = {
  method: 'GET',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json'
  },
  redirect: 'follow',
  referrerPolicy: 'no-referrer'
}
getProducts()

document
  .getElementById('submit')
  .addEventListener('click', (event) => {
    data.value = document.getElementById('data').value
    formAction();
    event.preventDefault();
  });

document.getElementById('register').addEventListener('click', (event) => {
  event.preventDefault();
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  register(email, password);
})

document.getElementById('login').addEventListener('click', (event) => {
  event.preventDefault();
  let email = document.getElementById('loginEmail').value;
  let password = document.getElementById('loginPassword').value;
  login(email, password);
})

function register(email, password) {
  let data = {};
  data.email = email;
  data.password = password;

  console.log('trying to send data to server app ', data)
  let requestParameters = { ...globalRequestParameters };
  requestParameters.method = 'POST';
  requestParameters.body = JSON.stringify(data);

  fetch(url + "user", requestParameters)
    .then(res => {

      res.text()
        .then(res => document.getElementById('registerResult').innerHTML = res)
    })
}

function login(email, password) {
  let data = {};
  data.email = email;
  data.password = password;

  console.log('trying to send data to server app ', data)
  let requestParameters = { ...globalRequestParameters };
  requestParameters.method = 'POST';
  requestParameters.body = JSON.stringify(data);

  fetch(url + "login", requestParameters)
    .then(res => {
      res.json()
        .then(res => {
          document.getElementById('login-result').innerHTML = res.message;
          if (res.token) {
            localStorage.setItem('token', res.token);
            seeIfLoggedIn();
          }
        })
    })
}

function formAction() {
  console.log('trying to send data to server app ', data)
  requestParameters = { ...globalRequestParameters };
  requestParameters.method = 'POST'
  requestParameters.body = JSON.stringify(data)
  fetch(url + "data", requestParameters)
    .then(res => {
      res.text()
        .then(res =>
          console.log(res))
    }
    )
}

function accessPrivateData() {
  let token = localStorage.getItem('token');
  console.log('vreau sa ma loghez cu ', token);
  if (token) {
    requestParameters = { ...globalRequestParameters };
    requestParameters.headers.Authorization = 'Bearer ' + token;
    fetch(url + 'private', requestParameters)
      .then(res => {
        res.text()
          .then(res =>
            document.getElementById('secret').innerHTML = res
          )
      })
  }
}

let products = []

function getProducts() {
  let requestParameters = { ...globalRequestParameters };

  fetch(url + 'products', requestParameters)
    .then(res => res.json().then(res => {
      products = res;
      renderProducts(res)
    }))
}

function renderProducts(products) {
  let productsWrapper = document.getElementById("products")
  productsWrapper.innerHTML = ''

  products.forEach((element) => {

    let node = document.createElement("div");
    node.setAttribute("class", "productRow")
    let nodeName = document.createElement("p");
    let nodeStatus = document.createElement("p");
    let nodeEditButton = document.createElement("button");
    let nodeDeleteButton = document.createElement("button");
    nodeName.innerHTML = element.name;
    nodeStatus.innerHTML = element.status;
    nodeEditButton.setAttribute("id", 'EDIT_' + element.id);
    nodeDeleteButton.setAttribute("id", 'DELETE_' + element.id);
    nodeEditButton.setAttribute("class", 'editButton');
    nodeDeleteButton.setAttribute("class", 'deleteButton');
    nodeEditButton.innerHTML = "EDIT";
    nodeDeleteButton.innerHTML = "DELETE";
    node.append(nodeName, nodeStatus, nodeEditButton, nodeDeleteButton);

    productsWrapper.appendChild(node);
  });
}

document.body.addEventListener('click', (event) => {
  if (event.target.classList.contains("editButton")) {
    fillEditForm(event.target.id);
  }
})
document.body.addEventListener('click', (event) => {
  if (event.target.classList.contains("deleteButton")) {
    deleteProduct(event.target.id);
  }
})

function fillEditForm(id) {
  console.log("Vrei sa editezi produsul cu id-ul " + id)
}

function deleteProduct(id) {
  id = id.split('_')[1];
  console.log("Vrei sa stergi produsul cu id-ul " + id);
  let requestParameters = { ...globalRequestParameters };
  let token = window.localStorage.getItem('token');
  requestParameters.headers.Authorization = 'Bearer ' + token;
  requestParameters.method = 'DELETE';
  fetch(url + 'product/' + id, requestParameters)
    .then(res => res.json())
    .then(res => {
      console.log(res.message);
      if (res.message === 'Decoding error!' || res.message === "Your token expired!") {
        console.log('nu ai voie!')
      } else {
        products = products.filter(element => element.id !== id)
        renderProducts(products);
      }

    })
}


document.getElementById('private').addEventListener('click', accessPrivateData)

document.body.addEventListener('click', function (event) {
  if (event.target.id == 'btnSubmit') {
    someFunc();
  };
});

document.getElementById('add-edit').addEventListener('click', function () {
  let action = this.innerHTML;
  if (action === 'Add') {
    addProduct();
  } else {
    editProduct(id);
  }
})

function addProduct() {
  let requestParameters = { ...globalRequestParameters };
  let token = window.localStorage.getItem('token');
  requestParameters.headers.Authorization = 'Bearer ' + token;
  requestParameters.method = 'POST';

  let data = {};
  data.name = document.getElementById('productName').value;
  data.status = document.getElementById('productStatus').value;
  requestParameters.body = JSON.stringify(data);
  console.log('Vreau sa adaug produsul: ', data);

  fetch(url + 'product', requestParameters)
    .then(res => res.json())
    .then(res => {
      data.id = res.id;
      products.push(data);
      renderProducts(products);
    })
}