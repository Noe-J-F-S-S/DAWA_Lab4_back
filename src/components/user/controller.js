import { PrismaClient } from "@prisma/client";
import Pusher from "pusher";



const prisma = new PrismaClient();

const pusher = new Pusher({
    appId: "1481295",
    key: "fe07f73383d210d863f2",
    secret: "18e101358e8bff0fb34e",
    cluster: "us2",
    useTLS: true
  });



export const findAll = async (req, res) =>{
    try{
        const users = await prisma.user.findMany();

        res.json({
            ok: true,
            data: users,
        });
    }catch ( error){
        return res.status(500).json({
            ok: false,
            data: error.message
        })
    }
}

const findOne = async(email) => {
    try{
        return await prisma.user.findFirst({ where:{email}});
    } catch (error){
        return null;
    }
}

export const store = async ( req,  res) =>{
    try{
        const{body} = req;
        const userByEmail = await findOne(body.email);
        if(userByEmail){
            return res.json({
                ok:true,
                data: userByEmail,
            });
        }

        body.profile_url = `http://avatars.dicebear.com/api/avataaars/${body.name}.svg`;

        const user = await prisma.user.create({
            data: {
                ... body
            },
        });
        //////////AGREGADO////////////////////
        pusher.trigger("my-chat", "my-list-contacts", {
            message: "Call to update list contacts",
          });
        //////////AGREGADO////////////////////
        res.status(201).json({
            ok:true,
            data:user
        });
    }catch(error){
        return res.status(500).json({
            ok:true,
            data: error.message,
        });
    }
}