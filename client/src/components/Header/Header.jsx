import React, { useEffect, useState } from "react";
import "./Header.css";
import { Avatar } from '@chakra-ui/react';

const Header = () => {
    const [userName, setUserName] = useState('');

    useEffect(() => {

        setUserName(localStorage.getItem('username'));

    }, []);

    return (
        <div className="container">
            
            <div className="user">
                <span>{userName}</span>
                <Avatar className="avatar-logo" src='https://bit.ly/broken-link' />
            </div>
        </div>
    );
}

export default Header;
