import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar/Navbar";
import {
    Center, Spinner, Box, useToast } from '@chakra-ui/react';
import './Main.css';
import Header from "../../components/Header/Header";



const Main = () => {
    const [loading, setLoading] = useState(true);

    const toast = useToast();

    useEffect(() => {

        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 700));
            setLoading(false);
        };

        loadData();
    }, []);


    if (loading) {
        return (
            <Center h="100vh">
                <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl'
                    mr={5}
                />
                <p>Carregando...</p>
            </Center>
        );
    }

    return (
        <Box>
            <Header />
            <Navbar />
            <Box>

            </Box>
        </Box>
    );
}

export default Main;
