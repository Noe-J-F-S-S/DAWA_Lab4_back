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
 
export const findAll = async (req, res) => {
 const sender_id = Number(req.params.sender_id);
 const id = Number(req.params.id);
 
 try {
   const messages = await prisma.message.findMany({
     where: {
       OR: [
         {
           AND: [{ sender_id }, { user_id :id }],
         },
         {
           AND: [{ sender_id: id }, { user_id: sender_id }],
         },
       ],
     },
     include: {
       User: true,
     },
   });
 
   res.json({
     ok: true,
     data: messages,
   });
 } catch (error) {
   return res.status(500).json({
     ok: false,
     data: error.message,
   });
 }
};
 
export const store = async (req, res) => {
  try {
    const { body } = req;
  
    const message = await prisma.message.create({
      data: { ...body },
    });
   
    const newMessage = await prisma.message.findFirst({
      where: { id: message.id },
      include: {
        User: true,
      },
    });
  
    pusher.trigger("my-chat", `new-message-${body.user_id}-${body.sender_id}`, {
      message: newMessage,
    });
  
    res.status(201).json({
      ok: true,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      data: error.message,
    });
  }
 };
 
