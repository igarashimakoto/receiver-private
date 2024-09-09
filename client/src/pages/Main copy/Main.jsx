import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar/Sidebar";
import {
    Center, Spinner, Box, Text, Button, FormControl, FormLabel, Input,
    Select, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton, Tooltip,
    Checkbox, CheckboxGroup, Stack, FormHelperText
} from '@chakra-ui/react';
import './Main.css';
import agenda from "../../img/ReceiverLogo.png"
import Header from "../../components/Header/Header";
import axios from 'axios';

const Main = () => {
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [data, setData] = useState('');
    const [horarios, setHorarios] = useState([]);
    const toast = useToast();

    const initialRef = React.useRef(null);
    const finalRef = React.useRef(null);

    useEffect(() => {

        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 700));
            setLoading(false);
        };

        loadData();
    }, []);

    // const handleDataChange = (e) => {
    //     const selectedData = e.target.value;
    //     setData(selectedData);
    //     fetchHorarios(empresaId, selectedData);
    // };

    // const handleHorarioClick = (horario) => {
    //     setHorarioSelecionado(horario);
    // };

    // const handleAgendarClick = () => {
    //     const usuarioId = localStorage.getItem('userId');

    //     const agendamento = {
    //         usuarioId,
    //         empresaId,
    //         servicoId: servicoSelecionado,
    //         data,
    //         horario: horarioSelecionado
    //     };

    //     axios.post('http://localhost:3001/auth/agendamento', agendamento, {
    //         headers: {
    //             'x-access-token': localStorage.getItem('token')
    //         }
    //     })
    //         .then(response => {
    //             toast({
    //                 title: "Agendamento feito com sucesso!",
    //                 status: 'success',
    //                 isClosable: true,
    //                 position: 'top-right',
    //             });
    //             onClose();

    //             setEmpresaId('');
    //             setData('');
    //             setServicoSelecionado('');
    //             setHorarioSelecionado('');
    //             setHorarios([]);
    //         })
    //         .catch(error => {
    //             console.error('Erro ao realizar agendamento:', error);
    //             toast({
    //                 title: "Erro ao realizar agendamento",
    //                 status: 'error',
    //                 isClosable: true,
    //                 position: 'top-right',
    //             });
    //             setEmpresaId('');
    //             setData('');
    //             setServicoSelecionado('');
    //             setHorarioSelecionado('');
    //             setHorarios([]);
    //         });
    // };


    const handleClickClose = () => {
        onClose();
        setData('');
        setHorarios([]);
    };

    // const getCurrentDate = () => {
    //     const today = new Date();
    //     const year = today.getFullYear();
    //     const month = (today.getMonth() + 1).toString().padStart(2, '0');
    //     const day = today.getDate().toString().padStart(2, '0');
    //     return `${year}-${month}-${day}`;
    // };

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
        <div>
            <Header />
            <Sidebar />
            <div className="container-main">
                <div className="content">
                    <img src={agenda} alt="logo de calendario" />
                    <Button bg='#333' color='white' onClick={onOpen}>+ Novo agendamento</Button>
                </div>
                <Modal
                    initialFocusRef={initialRef}
                    finalFocusRef={finalRef}
                    isOpen={isOpen}
                    onClose={handleClickClose}
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Novo Agendamento:</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={4}>
                            <FormControl mt={4}>
                                <FormLabel>Data:</FormLabel>
                                <Input
                                    border='1px'
                                    type="date"
                                    placeholder='data'
                                    value={data}
                                //onChange={handleDataChange}

                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel mt={5}>Horário</FormLabel>
                                <Input border='1px' type='time' value={''} onChange={(e) => { }} />
                            </FormControl>

                            <FormControl>
                                <FormLabel mt={4}>Empresa</FormLabel>
                                <Select
                                    border='1px'
                                    placeholder="Selecione uma empresa"
                                //value={empresaId}
                                //onChange={handleEmpresaChange}
                                >
                                    {/* <option key={empresa.EmpresaID} value={empresa.EmpresaID}>{empresa.Nome}</option> */}
                                </Select>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Horários Disponíveis:</FormLabel>
                                <Box>
                                    {horarios.length > 0 ? (
                                        horarios.map(horario => (
                                            <Button
                                                //key={horario.Horario}
                                                //onClick={() => handleHorarioClick(horario.Horario)}
                                                m={1}
                                            // colorScheme={horarioSelecionado === horario.Horario ? 'blue' : 'gray'}
                                            >
                                                {/* {horario.Horario} */}
                                            </Button>
                                        ))
                                    ) : (
                                        <Text>Nenhum horário disponível</Text>
                                    )}
                                </Box>
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                colorScheme='blue'
                                mr={3}
                            //onClick={handleAgendarClick}
                            // isDisabled={!empresaId || !data || !horarioSelecionado || !servicoSelecionado}
                            >
                                Agendar
                            </Button>
                            <Button //onClick={handleClickClose}
                            >Cancelar
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}

export default Main;
