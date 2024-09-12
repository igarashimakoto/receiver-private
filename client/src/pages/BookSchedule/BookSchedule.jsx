import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar/Navbar";
import {
    Center, Spinner, Box, Button, FormControl, FormLabel, Input, Text, Flex,
    useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton, Checkbox, Stack, HStack,  Heading 
} from '@chakra-ui/react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay
} from '@chakra-ui/react';

import './BookSchedule.css';
import Header from "../../components/Header/Header";
import axios from 'axios';


const BookSchedule = () => {
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const cancelRef = React.useRef();
    const [bookedSchedules, setBookedSchedules] = useState([]);    

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 700));
            setLoading(false);
        };

        loadData();

    }, []);

    const openAlert = (timeid) => {
        setIsAlertOpen(true);
        setTimeIdToDelete(timeid);
    };

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
                                        <Button colorScheme="red" onClick={() => openAlert(time.schedule_id)}>
                                            Excluir
                                        </Button>
                                    </Flex>
                                </Box>
                            ))
                        ) : (
                            <Text>Nenhum horário cadastrado.</Text>
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
                                    Confirmar Exclusão
                                </AlertDialogHeader>

                                <AlertDialogBody>
                                    Tem certeza que deseja excluir este horário? Esta ação não pode ser desfeita.
                                </AlertDialogBody>

                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                                        Excluir
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
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

export default BookSchedule;
