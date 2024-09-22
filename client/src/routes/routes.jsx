import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Home from '../pages/Home/Home';
import PrivateRoute from './PrivateRoute';
import Main from '../pages/Main/Main';
import Logout from '../pages/Logout/Logout';
import MainEnterprise from '../pages/MainEnterprise/MainEnterprise';
import SchedulesEnterprise from '../pages/SchedulesEnterprise/SchedulesEnterprise';
import SchedulesUser from '../pages/SchedulesUser/SchedulesUser'; 


const AppRouter = () => {
    return (
      <BrowserRouter>
        <Routes>

          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/logout' element={<Logout/>}/>
          <Route path='/cadastro' element={<Register/>}/>
          <Route element={<PrivateRoute />}>

            <Route path='/main' element={<Main/>}/>
            <Route path='/mainEnterprise' element={<MainEnterprise/>}/>     
            <Route path='/schedulesEnterprise' element={<SchedulesEnterprise/>}/>       
            <Route path='/schedulesUser' element={<SchedulesUser/>}/>
                
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
  
  export default AppRouter;
  