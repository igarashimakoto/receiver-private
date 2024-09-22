import { InputGroup, Input, InputRightElement, Button, FormLabel, FormControl, Center, Spinner, Select } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import '../Register/Register.css'
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';

const Register = () => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [userTypes, setUserTypes] = useState([]);
    const [userType, setUserType] = useState('');
    const toast = useToast();
    const navigate = useNavigate();
    const [enterpriseDesc, setEnterpriseDesc] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [address, setAddress] = useState('');

    const handleClick = () => setShow(!show);

    useEffect(() => {

        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 700));
            setLoading(false);
        };

        loadData();

        console.log('Fetching userTypes...');
        axios.get('http://localhost:3001/control/userTypes')
            .then(response => {
                console.log('userTypes:', response.data);
                setUserTypes(response.data);
            })
            .catch(error => {
                console.error('Erro ao buscar tipos:', error);
            });

    }, []);

    const handleRegister = () => {
        const userData = {
            email: email,
            name: name,
            password: password,
            phone: phone,
            userType: userType,
            enterpriseDesc : enterpriseDesc,
            cnpj : cnpj,
            address : address
        };

        console.log(userData);

        axios.post("http://localhost:3001/register", userData)
            .then((response) => {
                console.log(response);
                toast({
                    title: "Cadastro feito com Sucesso",
                    status: 'success',
                    isClosable: true,
                    position: 'top-right',
                });
                navigate('/login');
            })
            .catch((error) => {
                console.error("Erro ao fazer a solicitação:", error);
                toast({
                    title: "Erro ao fazer a solicitação",
                    status: 'error',
                    isClosable: true,
                    position: 'top-right',
                });
            });
    };

  
    const validateRegister = () => {
        if ((!name || !password || !email || !phone || name.length < 3 || password.length < 3 || email.length < 3 || phone.length < 10) || 
        (userType === 3 && (!enterpriseDesc || !cnpj || !address)))
        {
            toast({
                title: "Todos os campos são obrigatórios!",
                status: 'error',
                isClosable: true,
                position: 'top-right',
            });
            console.error('Todos os campos são obrigatórios.');
            return;
        } else {
            setEmail('');
            setName('');
            setPassword('');
            setPhone('');
            setEnterpriseDesc('');
            setCnpj('');
            setAddress('');

            handleRegister();
        }
    };

    const handlePhoneBlur = () => {

        //celular
        if (phone.length === 11) {
            const formattedPhone = `(${phone.slice(0, 2)})${phone.slice(2, 7)}-${phone.slice(7)}`;
            setPhone(formattedPhone);

            //telefone fixo    
        } else if (phone.length === 10) {
            const formattedPhone = `(${phone.slice(0, 2)})${phone.slice(2, 6)}-${phone.slice(6)}`;
            setPhone(formattedPhone);
        }
    }

    const handlePhoneChange = (e) => {

        const value = e.target.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
        setPhone(value);
    };

    const handleUserTypeChange = (e) => {
        const userTypeId = e.target.value;
        console.log(userTypeId)
        setUserType(e.target.value);
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
        <div className="bgRegister">
            <div className="box-register">
                <div className="form-register">
                    <div className="box-title-register">
                        <span className="title-register">CADASTRO</span>
                    </div>

                    <div className="columns-container">
                        <div className="column">
                            <FormControl>
                                <FormLabel mt={4}>Tipo de usuário</FormLabel>
                                <Select border='1px' value={userType} onChange={handleUserTypeChange}>
                                    <option value="" hidden>Selecione um tipo</option>
                                    {userTypes.map(users_types => (
                                        <option key={users_types.usertyp_code} value={users_types.usertyp_code}>
                                            {users_types.usertyp_description}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel mt={4}>Nome</FormLabel>
                                <Input
                                    placeholder='Nome completo'
                                    type='text'
                                    marginBottom='1rem'
                                    border='1px'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Telefone</FormLabel>
                                <Input
                                    placeholder='(44)99835-7481'
                                    type='text'
                                    marginBottom='1rem'
                                    border='1px'
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onBlur={handlePhoneBlur}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    placeholder='exemple@exemple.com'
                                    type='email'
                                    marginBottom='1rem'
                                    border='1px'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Senha</FormLabel>
                                <InputGroup>
                                    <Input
                                        pr='4.5rem'
                                        type={show ? 'text' : 'password'}
                                        placeholder=''
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
                        </div>
                        {userType === '3' && (
                            <div className="column">
                                <FormControl mt={4}>
                                    <FormLabel>Descrição da Empresa</FormLabel>
                                    <Input
                                        placeholder='Descrição da empresa'
                                        type='text'
                                        border='1px'
                                        value={enterpriseDesc}
                                        onChange={(e) => setEnterpriseDesc(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl mt={4}>
                                    <FormLabel>CNPJ da Empresa</FormLabel>
                                    <InputMask
                                        mask="99.999.999/9999-99"
                                        value={cnpj}
                                        onChange={(e) => setCnpj(e.target.value)}
                                    >
                                        {(inputProps) => (
                                            <Input
                                                {...inputProps}
                                                type="text"
                                                placeholder="00.000.000/0000-00"
                                                border="1px"
                                            />
                                        )}
                                    </InputMask>
                                </FormControl>

                                <FormControl mt={4}>
                                    <FormLabel>Endereço da Empresa</FormLabel>
                                    <Input
                                        placeholder='Endereço completo'
                                        type='text'
                                        border='1px'
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </FormControl>
                            </div>
                        )}
                    </div>

                    <Button className="button-submit" type="submit" onClick={validateRegister} 
                            colorScheme='green' mt='6' mb='6' width={'280px'} alignSelf={'center'}>
                                CADASTRAR CONTA
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Register;
