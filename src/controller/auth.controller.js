import UserModel  from "../model/user.model.js";
import { JwtHelper } from "../utils/JWThelper.js";
import bcrypt from 'bcrypt';

export class authController {

    static async register(req, res){
        try {
            const {name,
                id,
                address,
                email,
                phone,
                password,
                typeUser} = req.body;
            const hashed = await bcrypt.hash(password, 10);

            if (await UserModel.isRegisterIndentify(id)) {
                return res.status(200).json({ msg: 'Usuario ya registrado con esa identificación.' });
            }

            if (await UserModel.isRegisterEmail(email)) {
                return res.status(200).json({ msg: 'Usuario ya registrado con ese correo.' });
            }

            if (await UserModel.register(name,id,address, email, phone,hashed,typeUser)) {
                return res.status(200).json({ msg: 'Usuario registrado correctamente.' });
        }
        }catch (error) {
            console.error('registerController error: ', error);
            res.status(500).json({ msg: 'Error en el servidor' });
            
        }
    }
        
//TODO LOGIN NO FUNCIONA AUN
    static async login(req, res){
        try {
            const { email,
            password } = req.body;

            if(await UserModel.isRegisterEmail(email)){
                const user = await UserModel.getPass(email);
                const match = user && await bcrypt.compare(password, user.password);

                if(match){
                    const token = JwtHelper.generateKey({ id: user.id, email: user.email, typeUser: user.typeUser });
                    return res.status(200).json({ msg: 'Login exitoso', token });
                }else{
                    return res.status(200).json({ msg: 'Contraseña incorrecta' });
                }
        
            }
        } catch (error) {
        console.error('loginController error: ', error);
        res.status(500).json({ msg: 'Error en el servidor' });
        }
    }
        
    // static async progress(req, res){

    //     const { token } = req.body;
    //     console.log(token);

    //     try {
            
    //         const user = await JwtHelper.verifyKey(token);
    //         if (user) {

    //             //Aqui va el codigo para dar el progreso

    //         }
    //         else{
    //             return res.status(401).json({ message: 'Invalid token' });
    //         }

    //     } catch (error) {
    //         console.error(error);
    //     }

    //     res.json("Logout user");
    
    // }

}