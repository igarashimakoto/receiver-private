import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar/Navbar";
import {
    Center, Spinner, Box, Button, FormControl, FormLabel, Input, Text, Flex,
    useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton, Checkbox, CheckboxGroup, Stack, HStack, Td, Tbody, Th, Thead, Table, InputRightElement,
    TableContainer, Heading, Tr, InputGroup, IconButton,
} from '@chakra-ui/react';
import './SchedulesEnterprise.css';
import agenda from "../../img/ReceiverLogo.png"
import Header from "../../components/Header/Header";
import axios from 'axios';
import { SearchIcon } from '@chakra-ui/icons';

const SchedulesEnterprise = () => {
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [timeStart, setTimeStart] = useState('');
    const [timeEnd, setTimeEnd] = useState('');
    const [times, setTimes] = useState([]);
    const toast = useToast();
    const [selectedDays, setSelectedDays] = useState({
        "segunda_feira": 0,
        "terça_feira": 0,
        "quarta_feira": 0,
        "quinta_feira": 0,
        "Sexta_feira": 0,
        "sábado": 0,
        "domingo": 0,
    });

    const [filterDate, setFilterDate] = useState("");
    const [agendamentos, setAgendamentos] = useState([]);

    const initialRef = React.useRef(null);
    const finalRef = React.useRef(null);

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 700));
            setLoading(false);
        };

        loadData();
        fetchTimes();

    }, []);

    const handleClickClose = () => {
        onClose();
        setTimeEnd('');
        setTimeStart('');
        setSelectedDays(
            {
                "segunda_feira": 0,
                "terça_feira": 0,
                "quarta_feira": 0,
                "quinta_feira": 0,
                "Sexta_feira": 0,
                "sábado": 0,
                "domingo": 0
            })
    };

    const handleDaysChange = (day) => {

        setSelectedDays((prevSelectedDays) => ({
            ...prevSelectedDays,
            [day]: prevSelectedDays[day] === 0 ? 1 : 0

        }));
    };

    const handleValidateRegister = () => {

        const allDaysUnselected = Object.values(selectedDays).every(value => value === 0);

        console.log(allDaysUnselected, timeStart, timeEnd);

        if (allDaysUnselected || !timeStart || !timeEnd || timeEnd < timeStart) {
            toast({
                title: "É obrigatório marcar pelo menos um dia e um intervalo de horário!",
                status: 'error',
                isClosable: true,
                position: 'top-right',
            });
            console.error('Todos os campos são obrigatórios.');
            return;
        } else {

            handleRegisterTime();
        }
    }

    const handleRegisterTime = () => {

        console.log(times);

        const getUserID = localStorage.getItem('userId');

        const selectedDaysString = Object.keys(selectedDays)
            .filter(day => selectedDays[day] === 1)
            .join(',');

        const Data = {
            userID: getUserID,
            dayOfWeek: selectedDaysString,
            timeStart: timeStart,
            timeEnd: timeEnd
        }

        axios.post("http://localhost:3001/register/time", Data,
            {
                headers: {
                    'x-access-token': localStorage.getItem('token'),
                }
            })
            .then((response) => {
                toast({
                    title: "Cadastro feito com Sucesso",
                    status: 'success',
                    isClosable: true,
                    position: 'top-right',
                });
            })
            .catch((error) => {

                if (error.status = 400) {

                    toast({
                        title: "Horário ja cadastrado",
                        status: 'error',
                        isClosable: true,
                        position: 'top-right',
                    });
                } else {

                    toast({
                        title: "Erro ao fazer a solicitação",
                        status: 'error',
                        isClosable: true,
                        position: 'top-right',
                    });
                }
                console.error("Erro ao fazer a solicitação:", error);
            });

        fetchTimes();      

        handleClickClose();

    }

    const fetchTimes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/control/times', {
                headers: {
                    'x-access-token': token
                }
            });

            setTimes(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Erro ao buscar horários:', error);
        }
    };

    const handleDelete = async (timeid) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/schedules/${timeid}`, {
                headers: { 'x-access-token': token },
            });
            toast({
                title: 'Horário excluído com sucesso!',
                status: 'success',
                isClosable: true,
                position: 'top-right',
            });

            setTimes((prevSchedules) => prevSchedules.filter((times) => times.schedule_id !== timeid));
        } catch (error) {
            console.error('Erro ao excluir horário:', error);
            toast({
                title: 'Erro ao excluir horário',
                status: 'error',
                isClosable: true,
                position: 'top-right',
            });
        }

        // Chama a função para buscar os horários atualizados
        fetchTimes();

        // Fecha o modal após a gravação
        handleClickClose();
    };



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

            <Box p={4} className="container-main">

                <Heading mb={6}>Horários Cadastrados</Heading>
                {/* Definindo um Box com altura fixa e rolagem */}
                <Box className='box-list' p={4}>
                    <Stack spacing={4}>
                        {times.length > 0 ? (
                            times.map((time) => (
                                <Box
                                    key={time.schedule_id}
                                    p={4}
                                    borderWidth={1}
                                    borderRadius="md"
                                    boxShadow="md"
                                    bg="white"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    <Flex justify="space-between" align="center">
                                        <Box>
                                            <Text fontSize="lg" fontWeight="bold">
                                                Dias da semana: {time.schedule_daysofweek}
                                            </Text>
                                            <Text>
                                                Horário: {time.schedule_time_start} - {time.schedule_time_end}
                                            </Text>
                                        </Box>
                                        <Button colorScheme="red" onClick={() => handleDelete(time.schedule_id)}>
                                            Excluir
                                        </Button>
                                    </Flex>
                                </Box>
                            ))
                        ) : (
                            <Text>Nenhum horário cadastrado.</Text>
                        )}
                    </Stack>
                </Box>

                <Box>
                    <Button bg='#333' color='white' onClick={onOpen}>+ Novo intervalo de Horário</Button>
                </Box>

                <Modal
                    isOpen={isOpen}
                    onClose={handleClickClose}
                >

                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Novo intervalo de Horário:</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={4}>

                            <FormControl mt={4}>
                                <FormLabel>Selecione os dias da semana:</FormLabel>
                                <Stack direction="row" spacing={3} className="modal-checkbox-group">
                                    {Object.keys(selectedDays).map((day) => (
                                        <Checkbox
                                            className="custom-checkbox"
                                            key={day}
                                            value={day}
                                            isChecked={selectedDays[day] === 1}
                                            onChange={() => handleDaysChange(day)}
                                        >
                                            {day}
                                        </Checkbox>
                                    ))}
                                </Stack>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Intervalo de horários:</FormLabel>
                                <HStack spacing={5}>
                                    <Box>
                                        <FormLabel>Horário Inicial</FormLabel>
                                        <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
                                    </Box>

                                    <Box>
                                        <FormLabel>Horário Final</FormLabel>
                                        <Input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
                                    </Box>
                                </HStack>
                            </FormControl>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={handleValidateRegister}>Gravar</Button>
                            <Button onClick={handleClickClose}>Cancelar</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </Box>
    );
};

export default SchedulesEnterprise;
