import jwt, { decode } from 'jsonwebtoken';

import axios from "axios";

const auth = async (req, res, next) => {
    try {

        const token = req.headers.authorization.split(" ")[1];
        const authType = req.headers.authtype;

        let decodedData;
        if (token && authType === "Primary") {
            decodedData = jwt.verify(token, "SECRET_TEST_STRING");
            req.userId = decodedData?.id;
        } else {

            const api = axios.create({ baseURL: 'https://oauth2.googleapis.com' });
            const { data } = await api.get(`tokeninfo?access_token=${token}`);
            decodedData = data;
            req.userId = decodedData?.sub;
        }
        next();
    } catch (error) {
        res.status(400).json({ message: error });
        console.log(error);
    }
};

export default auth;