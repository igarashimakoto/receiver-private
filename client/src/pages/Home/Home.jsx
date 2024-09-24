import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Center, Spinner } from '@chakra-ui/react';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
        };

        loadData();
    }, []);

    const HomePickHandler = () => {
        navigate('/');
    };

    const LoginPickHandler = () => {
        navigate('/login');
    };

    const RegisterEmpHandler = () => {
        navigate('/cadastro');
    };

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='green.500'
                size='xl'
                mr={5}
                />
                <p>Carregando...</p>
            </Center>
        );
    }

    return (
        <div className='bg'>
            <header>
                <h1 onClick={HomePickHandler}>Receiver</h1>
                <div className='button-container'>
                    <Button className='button-format' onClick={LoginPickHandler} colorScheme='green'>Acessar</Button>
                </div>
            </header>
            <main>
                <div className='container'>

                    <p>Otimize seu gerenciamento do recebimento de carga da sua empresa com o Receiver!</p>
                    <p>Contrate nosso sistema de agendamento agora mesmo.</p>
                    <Button className='button-format' onClick={RegisterEmpHandler} mt={5} colorScheme='green'>Cadastre seu usuário</Button>
                </div>
            </main>
        </div>
    );
};

export default Home;
