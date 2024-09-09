import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar/Sidebar";
import {
    Center, Spinner, Box, Text, Button, FormControl, FormLabel, Input,
    Select, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton, Checkbox, CheckboxGroup, Stack, HStack
} from '@chakra-ui/react';
import './MainEnterprise.css';
import agenda from "../../img/ReceiverLogo.png"
import Header from "../../components/Header/Header";

const MainEnterprise = () => {
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { timeStart, setTimeStart } = useState(0);
    const { timeEnd, setTimeEnd } = useState(0);
    const [data, setData] = useState('');
    const [horarios, setHorarios] = useState([]);
    const toast = useToast();
    const [selectedDays, setSelectedDays] = useState({
        "Segunda-feira": 0,
        "Terça-feira": 0,
        "Quarta-feira": 0,
        "Quinta-feira": 0,
        "Sexta-feira": 0,
        "Sábado": 0,
        "Domingo": 0,
    });

    const initialRef = React.useRef(null);
    const finalRef = React.useRef(null);

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 700));
            setLoading(false);
        };

        loadData();
    }, []);

    const handleClickClose = () => {
        onClose();
        setData('');
        setHorarios([]);
    };

    // Função que atualiza os valores dos checkboxes
    const handleDaysChange = (day) => {

        setSelectedDays((prevSelectedDays) => ({
            ...prevSelectedDays,
            [day]: prevSelectedDays[day] === 0 ? 1 : 0 // Alterna entre 0 e 1

        }));
    };

    handleValidateRegister = () => {

        if (selectedDays === '0000000' || !timeStart || !timeEnd) {
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

        const Data = {
            userID : '',
            dayOfWeek : selectedDays['Segunda-feira'] + selectedDays['Terça-feira'] + selectedDays['Quarta-feira'] + 
            selectedDays['Quinta-feira'] + selectedDays['Sexta-feira'] + selectedDays.Sábado + selectedDays.Domingo,
            timeStart : timeStart,
            timeEnd : timeEnd
        }

        

    }

    useEffect(() => {
        console.log(selectedDays);
    }, [selectedDays]);

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
                    <Button bg='#333' color='white' onClick={onOpen}>+ Novo intervalo de Horário</Button>
                </div>
                <Modal
                    initialFocusRef={initialRef}
                    finalFocusRef={finalRef}
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
                                        <Input type="time" placeholder="Horário Inicial" />
                                    </Box>

                                    <Box>
                                        <FormLabel>Horário Final</FormLabel>
                                        <Input type="time" placeholder="Horário Final" />
                                    </Box>
                                </HStack>
                            </FormControl>

                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={handleRegisterTime}>Agendar</Button>
                            <Button onClick={handleClickClose}>Cancelar</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
};

export default MainEnterprise;
