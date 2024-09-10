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

            const token = jwt.sign({ id: user.use_id, role: user.Type }, SECRET_KEY, { expiresIn: '1h' });
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

const register_user = (req, res) => {
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
                                if (userType === 3) {

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

const register_Time = async (req, res) => {
    const { userID, dayOfWeek, timeStart, timeEnd } = req.body;

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM schedules WHERE schedule_dayofweek = ? or 
                      ? between schedule_time_start and schedule_time_end or 
                      ? between schedule_time_start and schedule_time_end`, [dayOfWeek, timeStart, timeEnd], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }

                if (result.length !== 0) {
                    console.log("Horário ja cadastrado");
                    return res.status(400).send({ success: false, msg: "Horário ja cadastrado" });
                }

                db.query(`INSERT INTO schedules (schedule_user_ent, schedule_dayofweek, schedule_time_start, schedule_time_end) 
                          VALUES (?, ?, ?, ?) `, [userID, dayOfWeek, timeStart, timeEnd], (err, result) => {

                    if (err) {
                        res.status(500).send("Erro ao cadastrar intervalo");
                    }

                    console.log("intervalo cadastrado com sucesso");
                    res.send("intervalo cadastrado com sucesso");

                })
            });
        });




    } catch (err) {
        console.error("Erro ao processar login:", err);
        return res.status(500).send({ success: false, error: "Erro ao processar login" });
    }

}




const get_user = async (req, res) => {

    try {
        const userId = req.userId;
        const result = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE users_id = ?", [userId], (err, result) => {
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
            id: user.user_id,
            email: user.user_email,
            phone: user.user_phone,
            enterprise: user.user_enterprise,
            name: user.user_name,
            type: user.user_type,
        };

        res.send({ success: true, user: userData });

    } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        return res.status(500).send({ success: false, error: "Erro ao buscar usuário" });
    }
}

const getUserTypes = (req, res) => {
    db.query("SELECT * FROM users_types WHERE usertyp_code <> 1", (err, result) => {
        if (err) {
            console.error("Erro ao buscar tipos de usuários:", err);
            return res.status(500).send("Erro ao buscar tipos de usuários");
        }
        res.send(result);
    });
};


const adminRoute = (req, res) => {
    res.send('Welcome, Admin');
};

const clientRoute = (req, res) => {
    res.send('Welcome, Client');
};

module.exports = {
    verifyJWT, typeMiddleware, login, register_user, get_user, getUserTypes,
    adminRoute, clientRoute, register_Time
}