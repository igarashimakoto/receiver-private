import React, { useEffect, useState } from "react";
import "./Header.css";
import { Avatar } from '@chakra-ui/react';

const Header = () => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUserName(user.nome);
        }
    }, []);

    return (
        <div className="navBar">
            <div className="user">
                <span>{userName}</span>
                <Avatar className="avatar-logo" src='https://bit.ly/broken-link' />
            </div>
        </div>
    );
}

export default Header;
