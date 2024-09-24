import React, { useState, useEffect, useCallback } from 'react';
import Navbar from "../../components/NavbarUser/NavbarUser";
import {
    Center, Spinner, Box, Button, FormControl, FormLabel, Input, Text, Flex,
    useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton, Stack, Heading,
    Select
} from '@chakra-ui/react';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import './SchedulesUser.css';
import Header from "../../components/Header/Header";
import axios from 'axios';


const SchedulesUser = () => {
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [bookedSchedules, setBookedSchedules] = useState([]);
    const [enterprises, setEnterprises] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const toast = useToast();
    const [scheduleId, setScheduleId] = useState(0);
    const [scheduleDate, setScheduleDate] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [comment, setComment] = useState('');
    const cancelRef = React.useRef();
    const [selectedEnterprise, setSelectedEnterprise] = useState(0);
    const [bookedIdToCancel, setBookedIdToCancel] = useState(0);
    const [filterStatus, setFilterStatus] = useState('todos');


    const fetchBookedSchedules = useCallback(async () => {
        const userid = localStorage.getItem('userid');
        try {

            console.log(userid, filterStatus);


            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3001/control/bookedSchedules/${userid}/${filterStatus}`, {
                headers: {
                    'x-access-token': token
                }
            });
            console.log('horários marcados', response.data);
            setBookedSchedules(response.data);
        } catch (error) {
            console.error('Erro ao buscar horários:', error);
        }
    }, [filterStatus]);


    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoading(false);
        };

        if (selectedEnterprise && scheduleDate) {

            enterpriseSchedules(selectedEnterprise, scheduleDate);
        }

        loadData();
        fetchBookedSchedules();
        fetchEnterprises();

    }, [selectedEnterprise, scheduleDate, fetchBookedSchedules]);


    const handleClickClose = () => {

        onClose();
        setScheduleId(0);
        setSelectedEnterprise(0);
        setScheduleDate(0); 
        setSchedules([]);
        setScheduleDate('');
        setComment('');

    };

    const handleChangeFilter = (status) => {

        setFilterStatus(status);
        fetchBookedSchedules();
    }

    const handleValidateBooking = () => {

        if (!scheduleId || !scheduleDate || !comment) {
            toast({
                title: "todos os campos são obrigatórios",
                status: 'error',
                isClosable: true,
                position: 'top-right',
            });
        } else {
            handleBookSchedule();
        }
    };

    const handleBookSchedule = async () => {

        const getUserID = localStorage.getItem('userid');

        const Data = {
            scheduleid: scheduleId,
            userid: getUserID,
            date: scheduleDate,
            comment: comment
        }

        await axios.post("http://localhost:3001/register/bookSchedule", Data,
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

                if (error.status === 400) {

                    toast({
                        title: "Horário indisponível",
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

        await fetchBookedSchedules();
        handleClickClose();

    }

    const fetchEnterprises = async () => {

        try {

            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/control/enterprises', {
                headers: {
                    'x-access-token': token
                }
            });

            console.log(response.data);
            setEnterprises(response.data);

        } catch (error) {

            console.error('Erro ao buscar empresas:', error);
        }
    }


    const enterpriseSchedules = async (enterpriseid, dateString) => {

        const date = new Date(dateString);
        const day = date.getDay();
        const daysOfWeek = ['segunda_feira', 'terca_feira', 'quarta_feira', 'quinta_feira', 'sexta_feira', 'sabado', 'domingo'];
        const dayOfWeek = daysOfWeek[day];
        const entid = enterpriseid;

        console.log('entrou na busca');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3001/control/schedules/${dayOfWeek}/${entid}`, {
                headers: {
                    'x-access-token': token
                }
            });

            setSchedules(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Erro ao buscar horários:', error);
        }
    }

    const handleCancelBooking = async () => {

        const Data = {
            scheduleBookedId: bookedIdToCancel,
            status: 'cancelado'
        }

        console.log('entrou aqui', Data);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3001/control/bookedSchedules/updateStatus', Data, {
                headers: {
                    'x-access-token': token
                }
            });

            setSchedules(response.data);
            console.log(response.data);
        } catch (error) {

            toast({
                title: "Erro ao marcar como cancelado",
                status: 'error',
                isClosable: true,
                position: 'top-right',
            });


            console.error('Erro ao marcar como cancelado:', error);
        }

        setIsAlertOpen(false);
        setBookedIdToCancel(0);
        fetchBookedSchedules();
    }

    const openAlert = (bookedScheduleId) => {
        setIsAlertOpen(true);
        setBookedIdToCancel(bookedScheduleId);
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
        <Box>
            <Header />
            <Navbar />

            <Box p={4} className="container-main">

                <Heading mb={6}>Entregas Cadastradas</Heading>

                <Flex justify="flex-end" mb={4}>
                    <Box />
                    <Select
                        width="200px"
                        value={filterStatus}
                        onChange={(e) => handleChangeFilter(e.target.value)}
                    >
                        <option value="todos">todos</option>
                        <option value="pendente">pendente</option>
                        <option value="confirmado">confirmado</option>
                        <option value="concluido">concluído</option>
                        <option value="cancelado">cancelado</option>
                        <option value="cancelado">recusado</option>
                    </Select>
                </Flex>

                <Box className='box-list' p={4}>
                    <Stack spacing={4}>
                        {bookedSchedules.length > 0 ? (
                            bookedSchedules.map((bookedSchedules) => (
                                <Box
                                    key={bookedSchedules.schedboo_id}
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
                                                Dia: {new Date(bookedSchedules.schedboo_date).toLocaleDateString()};
                                            </Text>
                                            <Text>
                                                Horário: {bookedSchedules.schedule_time_start} - {bookedSchedules.schedule_time_end};
                                            </Text>
                                            <Text>
                                                Empresa: {bookedSchedules.userent_desc};
                                            </Text>
                                            <Text>
                                                Situação: {bookedSchedules.schedboo_status};
                                            </Text>
                                        </Box>
                                        {bookedSchedules.schedboo_status === 'confirmado' || bookedSchedules.schedboo_status === 'pendente' ? (
                                            <Button colorScheme="red" onClick={() => { openAlert(bookedSchedules.schedboo_id) }}>
                                                Cancelar
                                            </Button>
                                        ) : null}
                                    </Flex>
                                </Box>
                            ))
                        ) : (
                            <Text>Nenhuma entrega cadastrada.</Text>
                        )}
                    </Stack>

                    <AlertDialog
                        isOpen={isAlertOpen}
                        leastDestructiveRef={cancelRef}
                        onClose={() => setIsAlertOpen(false)}
                    >
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                    Confirmar Cancelamento
                                </AlertDialogHeader>

                                <AlertDialogBody>
                                    Tem certeza que deseja cancelar esta entrega? Esta ação não pode ser desfeita.
                                </AlertDialogBody>

                                <AlertDialogFooter>

                                    <Button colorScheme="red" onClick={handleCancelBooking}>
                                        Cancelar
                                    </Button>

                                    <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                                        Voltar
                                    </Button>

                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </Box>

                <Box>
                    <Button bg='#333' color='white' onClick={onOpen}>+ Nova Entrega</Button>
                </Box>

                <Modal isOpen={isOpen} onClose={handleClickClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Nova Entrega:</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={4}>

                            <FormControl mb={4}>
                                <FormLabel>Empresa</FormLabel>
                                <Select placeholder="Selecione a empresa" onChange={(e) => setSelectedEnterprise(e.target.value)}>
                                    {enterprises.map((enterprise) => (
                                        <option key={enterprise.userent_id} value={enterprise.userent_id}>
                                            {enterprise.userent_desc}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel>Data</FormLabel>
                                <Input type="date" min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setScheduleDate(e.target.value)} value={scheduleDate} />
                            </FormControl>

                            {schedules.length > 0 && (
                                <FormControl mb={4}>
                                    <FormLabel>Horário</FormLabel>
                                    <Select placeholder="Selecione um horário" onChange={(e) => setScheduleId(e.target.value)}>
                                        {schedules.map((schedule) => (
                                            <option key={schedule.schedule_id} value={schedule.schedule_id}>
                                                {schedule.schedule_time_start} - {schedule.schedule_time_end}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl mb={4}>
                                <FormLabel>Comentário</FormLabel>
                                <Input type="text" value={comment} onChange={(e) => setComment(e.target.value)} />
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={handleValidateBooking}>Gravar</Button>
                            <Button onClick={handleClickClose}>Cancelar</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </Box>
    );
};

export default SchedulesUser;
