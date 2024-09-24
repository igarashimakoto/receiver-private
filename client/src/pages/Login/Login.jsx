import { InputGroup, Input, InputRightElement, Button, FormLabel, FormControl, Center, Spinner } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Login.css';
import { useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {jwtDecode} from 'jwt-decode';
import axios from "axios";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleClick = () => setShow(!show);
    const [show, setShow] = useState(false);
    const navigate = useNavigate();        

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 700));
            setLoading(false);
        };

        loadData();
    }, []);

    const handleLogin = () => {
        const userData = {
            email: email,
            password: password
        };

        axios.post("http://localhost:3001/login", userData)
            .then((response) => {
                if (response.data.success) {
                    const token = response.data.token;
                    const user = response.data.user;
                    localStorage.setItem('token', token);
                    localStorage.setItem('userid', user.id);
                    localStorage.setItem('username', user.name);

                    toast({
                        title: "Login realizado com Sucesso",
                        status: 'success',
                        isClosable: true,
                        position: 'top-right',
                    });

                    navigate('/mainEnterprise');

                    const type = jwtDecode(token).type;
                    console.log(type);
                    if (type === 2) {
                        navigate('/schedulesUser');
                    } else {
                        navigate('/mainEnterprise');
                    }
                } else {
                    toast({
                        title: "Senha ou usuário incorreto. Tente novamente!",
                        status: 'error',
                        isClosable: true,
                        position: 'top-right',
                    });

                }
            })
            .catch((error) => {
                console.error(error);
                toast({
                    title: "Erro ao fazer login. Tente novamente mais tarde.",
                    status: 'error',
                    isClosable: true,
                    position: 'top-right',
                });
                setEmail('');
                setPassword('');
            });
    };

    const validateLogin = () => {
        if (!email.trim() || !password.trim()) {
            toast({
                title: "Todos os campos precisam ser preenchidos",
                status: 'error',
                isClosable: true,
                position: 'top-right',
            });
            setEmail('');
            setPassword('');
            return;
        }

        handleLogin();
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
        <div className="bgLogin">
            <div className="box-login">
                <div className="form-login">
                    <div className="box-title-login">
                        <span className="title-login">LOGIN</span>
                    </div>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            placeholder='exemplo@gmail.com'
                            type='email'
                            marginBottom='2rem'
                            border='1px'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel mb='2'>Senha</FormLabel>
                        <InputGroup>
                            <Input
                                pr='4.5rem'
                                type={show ? 'text' : 'password'}
                                placeholder='senha'
                                border='1px'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <InputRightElement width='4.5rem'>
                                <Button h='1.50rem' size='sm' onClick={handleClick}>
                                    {show ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>
                    {/* <Link onClick={() => RegisterPickHandler()} fontSize='12' mt='2'>Criar uma conta</Link> */}
                    <Button type="submit" onClick={validateLogin} colorScheme='green' mt='6'>Fazer Login</Button>
                </div>
            </div>
        </div>
    );
}

export default Login;
