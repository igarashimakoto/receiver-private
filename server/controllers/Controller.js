const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const SECRET_KEY = 'secretkeyreceiver';

const verifyJWT = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send('No token provided');

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token');

        req.userId = decoded.id;
        req.userType = decoded.type;
        next();
    });
};

const typeMiddleware = (type) => {
    return (req, res, next) => {
        if (req.userType === type) {
            next();
        } else {
            res.status(403).send('Access denied');
        }
    };
};

const login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ success: false, msg: "Email e senha são obrigatórios" });
    }

    try {
        const result = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE users_email = ?", [email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.length === 0) {
            console.log("Usuário não encontrada para o email:", email);
            return res.status(404).send({ success: false, msg: "Usuário não encontrada" });
        }

        const user = result[0];

        if (!user.users_password) {
            console.log("Senha no banco de dados é inválida ou não fornecida");
            return res.status(400).send({ success: false, msg: "Senha inválida no banco de dados" });
        }

        const match = await bcrypt.compare(password, user.users_password);

        if (match) {

            const userData = {
                id: user.users_id,
                name: user.users_name,
                email: user.users_email,
                type: user.users_type,
            };

            const token = jwt.sign({ id: user.users_id, type: user.users_type }, SECRET_KEY, { expiresIn: '1h' });
            return res.send({ success: true, msg: "Usuário logado com sucesso", token, user: userData });
        } else {
            console.log("Senha incorreta para o email:", email);
            return res.status(401).send({ success: false, msg: "Senha incorreta" });
        }
    } catch (err) {
        console.error("Erro ao processar login:", err);
        return res.status(500).send({ success: false, error: "Erro ao processar login" });
    }
}

const registerUser = (req, res) => {
    const { email, name, password, phone, userType, enterpriseDesc, cnpj, address } = req.body;

    db.getConnection((err, connection) => {
        if (err) {
            console.error("Erro ao obter conexão:", err);
            return res.status(500).send("Erro ao obter conexão");
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error("Erro ao iniciar transação:", err);
                connection.release();
                return res.status(500).send("Erro ao iniciar transação");
            }

            connection.query('SELECT * FROM users WHERE users_email=?', [email], (err, result) => {
                if (err) {
                    console.error('Erro na verificação do email', err);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Erro ao verificar o email');
                    });
                }

                if (result.length > 0) {
                    console.log('Email já cadastrado');
                    return connection.rollback(() => {
                        connection.release();
                        res.status(400).send('Email já cadastrado');
                    });
                }

                connection.query('SELECT * FROM users_enterprise WHERE userent_cnpj=?', [cnpj], (err, result) => {
                    if (err) {
                        console.error('Erro na verificação do cnpj', err);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Erro ao verificar o cnpj');
                        });
                    }

                    if (result.length > 0) {
                        console.log('CNPJ já cadastrado');
                        return connection.rollback(() => {
                            connection.release();
                            res.status(400).send('CNPJ já cadastrado');
                        });
                    }

                    bcrypt.hash(password, saltRounds, (err, hash) => {
                        if (err) {
                            console.error("Erro ao gerar hash da senha:", err);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).send("Erro ao registrar usuário");
                            });
                        }

                        connection.query(`INSERT INTO users (users_email, users_name, users_password, users_phone, users_type) 
                              VALUES (?, ?, ?, ?, ?)`, [email, name, hash, phone, userType],
                            (err, response) => {
                                if (err) {
                                    console.error("Erro ao cadastrar o usuário:", err);
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).send("Erro ao cadastrar o usuário");
                                    });
                                }

                                //SE FOR RECEBEDOR, CADASTRA AS INFORMAÇÕES DE EMPRESA
                                if (userType == 3) {

                                    const userId = response.insertId;

                                    connection.query(`INSERT INTO users_enterprise (userent_id, userent_desc, userent_cnpj, userent_address) 
                                      VALUES (?, ?, ?, ?)`, [userId, enterpriseDesc, cnpj, address],
                                        (err, response) => {
                                            if (err) {
                                                console.error("Erro ao cadastrar a empresa do usuário:", err);
                                                return connection.rollback(() => {
                                                    connection.release();
                                                    res.status(500).send("Erro ao cadastrar a empresa do usuário");
                                                });
                                            }

                                            connection.commit((err) => {
                                                if (err) {
                                                    console.error("Erro ao fazer commit da transação:", err);
                                                    return connection.rollback(() => {
                                                        connection.release();
                                                        res.status(500).send("Erro ao finalizar o cadastro");
                                                    });
                                                }
                                                console.log("Usuário cadastrado com sucesso");
                                                connection.release();
                                                res.send("Usuário cadastrado com sucesso");
                                            });
                                        }
                                    );

                                } else {

                                    connection.commit((err) => {
                                        if (err) {
                                            console.error("Erro ao fazer commit da transação:", err);
                                            return connection.rollback(() => {
                                                connection.release();
                                                res.status(500).send("Erro ao finalizar o cadastro");
                                            });
                                        }
                                        console.log("Usuário cadastrado com sucesso");
                                        connection.release();
                                        res.send("Usuário cadastrado com sucesso");
                                    });
                                }
                            }
                        );
                    });
                });
            });
        });
    });
};

const getUser = async (req, res) => {

    try {
        const { id } = req.params;

        const result = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE users_id = ?", [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result === 0) {
            res.status(404).send('Usuário não encontrado');
        }

        const user = result[0];
        const userData = {
            id: user.users_id,
            email: user.users_email,
            phone: user.users_phone,
            name: user.users_name,
            type: user.users_type,
        };

        console.log(userData);

        res.send({ success: true, user: userData });

    } catch (err) {
        console.error("Erro ao buscar empresa:", err);
        return res.status(500).send({ success: false, error: "Erro ao buscar empresa" });
    }
}

const getUserTypes = async (req, res) => {
    db.query("SELECT * FROM users_types WHERE usertyp_code <> 1", (err, result) => {
        if (err) {
            console.error("Erro ao buscar tipos de usuários:", err);
            return res.status(500).send("Erro ao buscar tipos de usuários");
        }
        res.send(result);
    });
};

const getUserEnterprise = async (req, res) => {

    const { id } = req.params;

    try {

        const result = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users_enterprise 
                INNER JOIN users ON userent_id = users_id        
                WHERE userent_id = ?`, [id], (err, result) => {

                if (err) {

                    console.log(err)
                    reject(err);

                } else {

                    resolve(result);
                }
            });
        });

        if (result.length === 0) {

            return res.status(404).send({ success: false, msg: "Usuário não encontrado" });
        }

        const user = result[0];

        console.log(user);

        const userData = {
            id: user.users_id,
            email: user.users_email,
            phone: user.users_phone,
            name: user.users_name,
            type: user.users_type,
            entDesc: user.userent_desc,
            entCNPJ: user.userent_cnpj,
            entAddr: user.userent_address
        };

        console.log('userdata:', userData);

        res.send({ success: true, enterprise: userData });
    } catch (err) {

        console.log(err);
        return res.status(500).send("Erro ao buscar usuário");
    }
}

const getEnterprises = async (req, res) => {

    try {

        const result = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users_enterprise`, (err, result) => {
                if (err) {

                    console.log(err)
                    reject(err);
                } else {

                    resolve(result);
                }
            });
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({ success: false, error: "Erro ao buscar as empresas" });

    }
}


const registerSchedule = async (req, res) => {
    const { userID, dayOfWeek, timeStart, timeEnd } = req.body;

    console.log("registrando schedule: ", userID, dayOfWeek, timeStart, timeEnd);

    const daysArray = dayOfWeek.split(',').map(day => day.trim());

    console.log('resultado do daysarray:', daysArray);

    try {
        const conditions = daysArray.map(day => `FIND_IN_SET(?, schedule_daysofweek)`).join(' OR ');
        const values = daysArray.flatMap(day => [day]);

        console.log('resultado do values:', values);

        const existingSchedules = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM schedules 
                      WHERE (${conditions}) 
                      AND NOT (
                          (? >= schedule_time_start AND ? <= schedule_time_end) OR 
                          (schedule_time_start >= ? AND schedule_time_start <= ?) OR 
                          (schedule_time_end >= ? AND schedule_time_end <= ?)
                      ) and schedule_user_ent=?`,
                [...values, timeStart, timeEnd, timeStart, timeEnd, timeStart, timeEnd, userID], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });

        if (existingSchedules.length > 0) {
            return res.status(400).send({ success: false, msg: "Horário e dia já cadastrados" });
        }

        await new Promise((resolve, reject) => {
            db.query(`INSERT INTO schedules (schedule_user_ent, schedule_daysofweek, schedule_time_start, schedule_time_end) 
                      VALUES (?, ?, ?, ?)`,
                [userID, dayOfWeek, timeStart, timeEnd], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });

        res.send({ success: true, msg: "Intervalo cadastrado com sucesso" });

    } catch (err) {
        console.error("Erro ao processar cadastro:", err);
        res.status(500).send({ success: false, error: "Erro ao processar cadastro" });
    }
};



const getSchedules = async (req, res) => {

    const userid = req.userId;

    try {

        const result = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM schedules WHERE schedule_user_ent = ?`, [userid], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({ success: false, error: "Erro ao buscar horários da empresa" });

    }
}

const getSpecificSchedules = async (req, res) => {

    const { entid, dayOfWeek } = req.params;

    try {

        const result = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM schedules WHERE schedule_user_ent = ? AND FIND_IN_SET(?, schedule_daysofweek) 
                      ORDER BY schedule_time_start`, [entid, dayOfWeek], (err, result) => {
                if (err) {

                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({ success: false, error: "Erro ao buscar horários da empresa" });

    }
}



const deleteSchedule = async (req, res) => {

    const { timeid } = req.params;

    try {
        const result = await new Promise((resolve, reject) => {
            db.query("DELETE FROM schedules WHERE schedule_id = ?", [timeid], (err, result) => {
                if (err) {
                    console.error("Erro na exclusão:", err);
                    reject(err);
                } else {

                    resolve(result);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).send({ success: false, msg: "horário não encontrado" });
        }

        res.send({ success: true, msg: "Exclusão realizada com sucesso" });
    } catch (err) {
        console.error("Erro ao tentar excluir:", err);
        res.status(500).send({ success: false, error: "Erro ao tentar excluir" });
    }

}


const registerBookedSchedule = async (req, res) => {

    const { scheduleid, userid, date, comment } = req.body;

    try {
        const existingBookings = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM schedules_booked WHERE schedboo_date=? AND schedboo_schedule_id=? AND schedboo_status=?`,
                [date, scheduleid, 'pendente'], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });

        if (existingBookings.length !== 0) {
            return res.status(400).send({ success: false, msg: "Horário ja reservado" });
        }

        const result = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM schedules WHERE schedule_id=?`,
                [scheduleid], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });

        result.schedule_time_start

        await new Promise((resolve, reject) => {
            db.query(`INSERT INTO schedules_booked (schedboo_schedule_id, schedboo_user, schedboo_date, schedboo_status, schedboo_comment) 
                      VALUES (?, ?, ?, ?, ?)`,
                [scheduleid, userid, date, 'pendente', comment], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });

        res.send({ success: true, msg: "Reserva cadastrada com sucesso" });

    } catch (err) {
        console.error("Erro ao processar cadastro:", err);
        res.status(500).send({ success: false, error: "Erro ao processar cadastro" });
    }
};

const getEnterpriseBookings = async (req, res) => {

    const { userid, status } = req.params;

    try {

        if (status === 'todos') {

            const result = await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM schedules_booked 
                              INNER JOIN schedules ON schedboo_schedule_id = schedule_id
                              INNER JOIN users_enterprise ON schedule_user_ent = userent_id
                              INNER JOIN users ON schedboo_user = users_id
                              WHERE userent_id=?                               
                              ORDER BY schedboo_schedule_id
                              `, [userid], (err, result) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            res.send(result);
        } else {

            const result = await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM schedules_booked 
                              INNER JOIN schedules ON schedboo_schedule_id = schedule_id
                              INNER JOIN users_enterprise ON schedule_user_ent = userent_id
                              INNER JOIN users ON schedboo_user = users_id
                              WHERE userent_id=? AND schedboo_status=?
                              ORDER BY schedboo_schedule_id`
                    , [userid, status], (err, result) => {

                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
            });

            res.send(result);
        }

    } catch (err) {

        console.error('Erro no backend:', err);
        res.status(500).send({ success: false, error: "Erro ao buscar os horários" });

    }
}

const getBookedSchedules = async (req, res) => {

    const { userid, status } = req.params;

    try {

        if (status === 'todos') {

            const result = await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM schedules_booked 
                          INNER JOIN schedules ON schedboo_schedule_id = schedule_id
                          INNER JOIN users_enterprise ON schedule_user_ent = userent_id
                          INNER JOIN users ON schedboo_user = users_id
                          WHERE schedboo_user=? 
                          ORDER BY schedboo_date, schedule_time_start
                          `, [userid], (err, result) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            console.log(result);

            res.send(result);

        } else {

            const result = await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM schedules_booked 
                          INNER JOIN schedules ON schedboo_schedule_id = schedule_id
                          INNER JOIN users_enterprise ON schedule_user_ent = userent_id
                          WHERE schedboo_user=? AND schedboo_status=?
                          ORDER BY schedboo_date, schedule_time_start
                          `, [userid, status], (err, result) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            res.send(result);
        }


    } catch (err) {
        res.status(500).send({ success: false, error: "Erro ao buscar os horários" });

    }
};


const updateBookedScheduleStatus = async (req, res) => {

    const { scheduleBookedId, status } = req.body;

    try {
        const result = await new Promise((resolve, reject) => {
            db.query("UPDATE schedules_booked SET schedboo_status=? WHERE schedboo_id=?", [status, scheduleBookedId], (err, result) => {
                if (err) {
                    console.error("Erro na exclusão:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).send({ success: false, msg: "horário não encontrado" });
        }

        res.send({ success: true, msg: "Update realizada com sucesso" });
    } catch (err) {
        console.error("Erro ao tentar atualizar:", err);
        res.status(500).send({ success: false, error: "Erro ao tentar atualizar" });
    }

};

const deleteBookedSchedule = async (req, res) => {

    const { scheduleId, date, userId } = req.Body;

    try {
        const result = await new Promise((resolve, reject) => {
            db.query("DELETE FROM schedules_booked WHERE schedboo_id=? AND schedboo_date=? AND schedboo_user=?", [scheduleId, date, userId], (err, result) => {
                if (err) {
                    console.error("Erro na exclusão:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).send({ success: false, msg: "horário não encontrado" });
        }

        res.send({ success: true, msg: "Exclusão realizada com sucesso" });
    } catch (err) {
        console.error("Erro ao tentar excluir:", err);
        res.status(500).send({ success: false, error: "Erro ao tentar excluir" });
    }


}


module.exports = {
    verifyJWT, typeMiddleware, login, registerUser, getUser, getUserTypes, getSchedules,
    registerSchedule, getUserEnterprise, getSchedules, deleteSchedule, getBookedSchedules, registerBookedSchedule, deleteBookedSchedule,
    getEnterprises, getSpecificSchedules, updateBookedScheduleStatus, getEnterpriseBookings
}