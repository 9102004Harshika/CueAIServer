import axios from 'axios';

const adminCreationToken = "some_secure_token";

axios.post('http://localhost:5000/create-admin', { 
    fname: 'Harshika', 
    lname: 'Gawade', 
    email: '9102004harshika@gmail.com', 
    token: adminCreationToken 
  })
  .then(result => {
    console.log('Admin created successfully');
  })
  .catch(err => console.log(err));
