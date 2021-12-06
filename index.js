//importing
import express from "express";
// require('dotenv').config();
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from "pusher";
import cors from 'cors'

//app config

const app = express();
const port = process.env.PORT || 5000;
const pusher = new Pusher({
    appId: "1310670",
    key: "26746cec59bda6ed24bd",
    secret: "c88532aec98241f55516",
    cluster: "eu",
    useTLS: true
});

const db = mongoose.connection;
db.once('open', () => {
    console.log('db is connected');
    const msgCollection = db.collection('whatsappdatas')
    const changes = msgCollection.watch()
    changes.on('change', (change) => {
        console.log('changes', change);
        if(change.operationType==='insert'){
            const data= change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:data.name,
                message:data.message,
                timestamp:data.timestamp,
                received:data.received
            })
        } else {
            console.log('error trigger pusher')
        }
    })
})



//middleware

app.use(express.json());
app.use(cors())
// app.use((req,res,next)=>{
//     res.setHeader('Access-Control-Allow-Origin','*')
//     res.setHeader('Access-Control-Allow-Headers','*')
//     next()
// })

//db config

const connection_url = 'mongodb+srv://doctorHabib:habib058@cluster0.y0jnn.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connection_url, {
    // useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})



///>?????

//routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})
app.post('/messages/new', (req, res) => {
    const dbMessage = req.body
    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

//listen
app.listen(port, () => console.log(`listening to the port ${port}`))
