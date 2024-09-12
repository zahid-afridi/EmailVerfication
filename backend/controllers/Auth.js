import { sendVerificationEamil, senWelcomeEmail } from "../middlewares/Email.js"
import { generateTokenAndSetCookies } from "../middlewares/GenerateToken.js"
import { Usermodel } from "../models/User.js"
import bcryptjs from 'bcryptjs'

const Reigster=async(req,res)=>{
    try {
        const {email,password,name}=req.body
        if (!email || !password || !name) {
            return res.status(400).json({success:false,message:"All fields are required"})
        }
        const ExistsUser= await Usermodel.findOne({email})
        if (ExistsUser) {
            return res.status(400).json({success:false,message:"User Already Exists Please Login"})
            
        }
        const hasePassowrd= await bcryptjs.hashSync(password,10)
        const verficationToken= Math.floor(100000 + Math.random() * 900000).toString()
        const user= new Usermodel({
            email,
            password:hasePassowrd,
            name,
            verficationToken,
            verficationTokenExpiresAt:Date.now() + 24 * 60 * 60 * 1000
        })
        await user.save()
       generateTokenAndSetCookies(res,user._id)
       await sendVerificationEamil(user.email,verficationToken)
        return res.status(200).json({success:true,message:"User Register Successfully",user})

    } catch (error) {
        console.log(error)
        return res.status(400).json({success:false,message:"internal server error"})
        
    }
}

const VerfiyEmail=async(req,res)=>{
    try {
        const {code}=req.body 
        const user= await Usermodel.findOne({
            verficationToken:code,
            verficationTokenExpiresAt:{$gt:Date.now()}
        })
        if (!user) {
            return res.status(400).json({success:false,message:"Inavlid or Expired Code"})
                
            }
          
     user.isVerified=true;
     user.verficationToken=undefined;
     user.verficationTokenExpiresAt=undefined;
     await user.save()
     await senWelcomeEmail(user.email,user.name)
     return res.status(200).json({success:true,message:"Email Verifed Successfully"})
           
    } catch (error) {
        console.log(error)
        return res.status(400).json({success:false,message:"internal server error"})
    }
}

export {Reigster,VerfiyEmail}