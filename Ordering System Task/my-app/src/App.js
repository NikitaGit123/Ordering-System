import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderPage from './Frontend/OrderPage';
import UserForm from './Frontend/UserForm';


const App = () => {
  return (
    <Router>
      <div className='App App-header'>
      <Routes>
        <Route path="/" element={<OrderPage/>} />
        <Route path="/userForm" element={<UserForm/>} />
      </Routes>
      </div>
    </Router>
  );
};

export default App;
