import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Center, Flex, Heading, Spinner, Stack, Text, useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Navbar from "../../components/NavbarEnterprise/NavbarEnterprise";

const MainEnterprise = () => {
    const [loading, setLoading] = useState(true);
    const [scheduledBookings, setScheduledBookings] = useState([]);
    const [isAlertOpen, setAlertOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [actionType, setActionType] = useState(null);
    const toast = useToast();
    const [filterStatus, setFilterStatus] = useState('todos');
    const [userInfo, setUserInfo] = useState({});
    const [isUserInfoOpen, setUserInfoOpen] = useState(false);

    const fetchScheduledBookings = useCallback(async () => {

        const userId = localStorage.getItem('userid');

        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`http://localhost:3001/control/enterprise/bookings/${userId}/${filterStatus}`, {
                headers: {
                    'x-access-token': token
                }
            });

            console.log('resultado do fetch', response.data);
            setScheduledBookings(response.data);
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
        }
    }, [filterStatus]);

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoading(false);
        };

        fetchScheduledBookings();
        loadData();
    }, [fetchScheduledBookings]);

    const fetchDelivererInfo = async (userId) => {

        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:3001/user/${userId}`, {
                headers: {
                    'x-access-token': token,
                },
            });

            console.log(response.data);

            setUserInfo(response.data.user);
            setUserInfoOpen(true);
        } catch (error) {

            console.error('Erro ao buscar informações do usuário:', error);
        } finally {

            setUserInfoOpen(true);
        }
    };


    const handleAlertConfirm = () => {

        console.log(selectedBookingId, actionType);

        if (selectedBookingId && actionType) {
            handleStatusChange(selectedBookingId, actionType === 'confirmar' ? 'confirmado' : actionType === 'recusar' ? 'recusado' : 'concluído');
        }
        setAlertOpen(false);

    };

    const handleStatusChange = async (bookingId, status) => {
        const Data = {
            scheduleBookedId: bookingId,
            status: status
        };

        console.log('status change', Data);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3001/control/bookedSchedules/updateStatus', Data, {
                headers: {
                    'x-access-token': token
                }
            });

            setScheduledBookings(response.data);
            toast({
                title: `Agendamento ${status === 'confirmado' ? 'aceito' : status === 'recusado' ? 'recusado' : 'concluído'}`,
                status: 'success',
                isClosable: true,
                position: 'top-right',
            });
        } catch (error) {
            toast({
                title: "Erro ao mudar o status",
                status: 'error',
                isClosable: true,
                position: 'top-right',
            });
            console.error('Erro ao mudar o status:', error);
        }

        await fetchScheduledBookings();
    };

    const openAlert = (bookingId, type, time, date) => {
        console.log('openAlert:', bookingId, type, time, date);

        const currentTime = new Date();

        const bookingDateOnly = new Date(date).toLocaleDateString('en-CA');
        const bookingTime = new Date(`${bookingDateOnly}T${time}`);

        const isPastTime = currentTime > bookingTime;

        console.log('hora atual:', currentTime, ' hora do agendamento:', bookingTime, ' passou da data:', isPastTime);

        const isDifferentDate = currentTime.toLocaleDateString() === new Date(date).toLocaleDateString();

        if (type === 'concluído' && !isPastTime && isDifferentDate) {
            toast({
                title: "Não é possível concluir",
                description: "Não é possível marcar como concluído antes do horário ou para uma data futura.",
                status: "error",
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        setSelectedBookingId(bookingId);
        setActionType(type);
        setAlertOpen(true);
    };


    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    const handleChangeFilter = (status) => {

        setFilterStatus(status);
        fetchScheduledBookings();
    }

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

                <Heading mb={6}>Agendamentos</Heading>

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
                        <option value="recusado">recusado</option>
                    </Select>
                </Flex>

                <Box className='box-list' p={4}>
                    <Stack spacing={4}>
                        {scheduledBookings.length > 0 ? (
                            scheduledBookings.map(booking => (
                                <Box
                                    key={booking.schedboo_id}
                                    p={4}
                                    borderWidth={1}
                                    borderRadius="md"
                                    boxShadow="md"
                                    bg="white"
                                    _hover={{ bg: 'gray.50' }}
                                    onClick={() => fetchDelivererInfo(booking.users_id)}>
                                    <Flex justify="space-between" align="center">
                                        <Box>
                                            <Text fontSize="lg" fontWeight="bold">
                                                Dia: {new Date(booking.schedboo_date).toLocaleDateString()}
                                            </Text>
                                            <Text>
                                                Horário: {booking.schedule_time_start} - {booking.schedule_time_end}
                                            </Text>
                                            <Text>
                                                Usuário: {booking.users_name}
                                            </Text>
                                            <Text>
                                                Situação: {booking.schedboo_status}
                                            </Text>
                                        </Box>
                                        <Flex>
                                            {booking.schedboo_status === 'pendente' ? (
                                                <Button colorScheme="green" mr={2} onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAlert(booking.schedboo_id, 'confirmar', booking.schedule_time_start, booking.schedboo_date)
                                                }}>
                                                    Aceitar
                                                </Button>
                                            ) : null}
                                            {booking.schedboo_status === 'pendente' ? (
                                                <Button colorScheme="red" mr={2} onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAlert(booking.schedboo_id, 'recusar', booking.schedule_time_start, booking.schedboo_date)
                                                }}>
                                                    Recusar
                                                </Button>
                                            ) : null}
                                            {booking.schedboo_status === 'confirmado' ? (
                                                <Button colorScheme="green" mr={2} onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAlert(booking.schedboo_id, 'concluído', booking.schedule_time_start, booking.schedboo_date)
                                                }}>
                                                    Concluir
                                                </Button>
                                            ) : null}
                                        </Flex>
                                    </Flex>
                                </Box>
                            ))
                        ) : (
                            <Text>Nenhum agendamento disponível.</Text>
                        )}
                    </Stack>

                    <Modal isOpen={isUserInfoOpen} onClose={() => setUserInfoOpen(false)}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Informações do Entregador</ModalHeader>
                            <ModalBody>
                                {userInfo && Object.keys(userInfo).length > 0 ? (
                                    <Box>
                                        <Text><strong>Nome:</strong> {userInfo.name}</Text>
                                        <Text><strong>Email:</strong> {userInfo.email}</Text>
                                        <Text><strong>Telefone:</strong> {userInfo.phone}</Text>

                                    </Box>
                                ) : (
                                    <Text>Nenhuma informação disponível.</Text>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button colorScheme='blue' onClick={() => setUserInfoOpen(false)}>
                                    Fechar
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                    <AlertDialog isOpen={isAlertOpen} onClose={handleAlertClose}>
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                    Confirmar Ação
                                </AlertDialogHeader>
                                <AlertDialogBody>
                                    {actionType === 'confirmar' ? "Você tem certeza que deseja aceitar este agendamento?"
                                        : actionType === 'recusar' ? "Você tem certeza que deseja recusar este agendamento?"
                                            : "Você tem certeza que deseja finalizar este agendamento?"}
                                </AlertDialogBody>
                                <AlertDialogFooter>
                                    <Button onClick={handleAlertClose}>Cancelar</Button>
                                    <Button colorScheme='red' onClick={handleAlertConfirm} ml={3}>
                                        {actionType === 'confirmar' ? "Aceitar" : actionType === 'recusar' ? "Recusar" : "Finalizar"}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </Box>

            </Box>
        </Box>

    );
};

export default MainEnterprise;
