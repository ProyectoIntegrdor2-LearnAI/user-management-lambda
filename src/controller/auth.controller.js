import UserModel  from "../model/user.model.js";
import { JwtHelper } from "../utils/JWThelper.js";
import bcrypt from 'bcrypt';

export default class authController {

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

            } else {
                return res.status(400).json({ msg: 'No se pudo registrar el usuario.' });
            }
        }catch (error) {
            console.error('registerController error: ', error);
            res.status(500).json({ msg: 'Error en el servidor' });
            
        }
    }
        

    static async login(req, res){
        try {
            const { email, password } = req.body;

            if(await UserModel.isRegisterEmail(email)){
                const pass = await UserModel.getPass(email);
                if(!pass) {
                    return res.status(500).json({msg: 'Error al buscar contraseña'})
                }
                console.log("Resultado de getPass:", pass);
                const match = pass && await bcrypt.compare(password, pass.password);

                if(match){
                    const token = JwtHelper.generateKey(email);

                    if (!token) {
                        return res.status(500).json({ msg: 'Error al generar el token' });
                    }

                    return res.status(200).json({ msg: 'Login exitoso', token });
                }else{
                    return res.status(401).json({ msg: 'Contraseña incorrecta' }); 
                }
        
            } else {
                return res.status(404).json({ msg: 'Usuario no encontrado' }); 
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