import React, { useEffect, useState } from 'react';
import { Box, Button, Center, Flex, Heading, Spinner, Stack, Text, useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from '@chakra-ui/react';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Navbar from "../../components/NavbarEnterprise/NavbarEnterprise";

const MainEnterprise = () => {
    const [loading, setLoading] = useState(true);
    const [scheduledBookings, setScheduledBookings] = useState([]);
    const [isAlertOpen, setAlertOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [actionType, setActionType] = useState(null); // 'confirmar' ou 'recusar'
    const toast = useToast();

    const fetchScheduledBookings = async () => {
        const userId = localStorage.getItem('userid');
        try {
            const response = await axios.get(`http://localhost:3001/control/enterprise/bookings/${userId}`);
            setScheduledBookings(response.data);
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoading(false);
        };

        fetchScheduledBookings();
        loadData();
    }, []);

    const handleStatusChange = async (bookingId, status) => {
        const Data = {
            scheduleBookedId: bookingId,
            status: status
        };

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3001/control/bookedSchedules/updateStatus', Data, {
                headers: {
                    'x-access-token': token
                }
            });

            setScheduledBookings(response.data);
            toast({
                title: `Agendamento ${status === 'confirmado' ? 'aceito' : 'recusado'}`,
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
    };

    const openAlert = (bookingId, type) => {
        setSelectedBookingId(bookingId);
        setActionType(type);
        setAlertOpen(true);
    };

    const handleAlertConfirm = () => {
        if (selectedBookingId && actionType) {
            handleStatusChange(selectedBookingId, actionType === 'confirmar' ? 'confirmado' : 'recusado');
        }
        setAlertOpen(false);
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
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

                <Heading mb={6}>Agendamentos</Heading>
                <Box  className='box-list' p={4}>
                    <Stack spacing={4}>
                        {scheduledBookings.length > 0 ? (
                            scheduledBookings.map(booking => (
                                <Box key={booking.id} p={4} borderWidth={1} borderRadius="md" boxShadow="md">
                                    <Flex justify="space-between" align="center">
                                        <Box>
                                            <Text fontSize="lg" fontWeight="bold">
                                                Dia: {new Date(booking.date).toLocaleDateString()}
                                            </Text>
                                            <Text>
                                                Horário: {booking.time_start} - {booking.time_end}
                                            </Text>
                                            <Text>
                                                Usuário: {booking.userName}
                                            </Text>
                                            <Text>
                                                Situação: {booking.status}
                                            </Text>
                                        </Box>
                                        <Flex>
                                            <Button colorScheme="green" onClick={() => openAlert(booking.id, 'confirmar')} mr={2}>
                                                Aceitar
                                            </Button>
                                            <Button colorScheme="red" onClick={() => openAlert(booking.id, 'recusar')}>
                                                Recusar
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </Box>
                            ))
                        ) : (
                            <Text>Nenhum agendamento disponível.</Text>
                        )}
                    </Stack>

                    <AlertDialog isOpen={isAlertOpen} onClose={handleAlertClose}>
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                    Confirmar Ação
                                </AlertDialogHeader>
                                <AlertDialogBody>
                                    {actionType === 'confirmar' ? "Você tem certeza que deseja aceitar este agendamento?"
                                        : "Você tem certeza que deseja recusar este agendamento?"}
                                </AlertDialogBody>
                                <AlertDialogFooter>
                                    <Button onClick={handleAlertClose}>Cancelar</Button>
                                    <Button colorScheme='red' onClick={handleAlertConfirm} ml={3}>
                                        {actionType === 'confirmar' ? "Aceitar" : "Recusar"}
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
