import User from '../model/user.model.js'
import bcrypt from 'bcrypt';

export class authController {

    static async register(req, res){
        const { email
        ,username,
        password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email, 
        hashedPassword
    })
    await newUser.save();
    console.log(newUser );
    return res.status(201).json({ message: 'User created' });
    }

    static async login(req, res){

        const { email,
        password } = req.body;

        

        res.json("Login user");
    
    }

    static async progress(req, res){

        const { token } = req.body;
        console.log(token);

        try {
            
            const user = await JwtHelper.verifyKey(token);
            if (user) {

                //Aqui va el codigo para dar el progreso

            }
            else{
                return res.status(401).json({ message: 'Invalid token' });
            }

        } catch (error) {
            console.error(error);
        }

        res.json("Logout user");
    
    }

}