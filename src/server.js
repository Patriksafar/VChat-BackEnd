import express from 'express';
import cors from 'cors';
import server from 'http';
import socketIO from 'socket.io';
import { v4 as uuidV4 } from 'uuid';
import peer from 'peer';

const app = express();
const peerjsServer = peer.PeerServer;
const ExpressPeerServer = peer.ExpressPeerServer;
const serve = server.Server(app);
const io = socketIO(serve);
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/join', (req, res) => {
    res.send({ link: uuidV4() });
});

io.on('connection', socket => {
    console.log('socket established')
    socket.on('join-room', (roomID, userID) => {
        console.log('Joinned in Room', roomID);
        socket.join(roomID);
        socket.to(roomID).broadcast.emit('new-user-connect', userID);
        socket.on('disconnect', () => {
            socket.to(roomID).broadcast.emit('user-disconnected', userID);
        })
    })
});

// Server listen initilized
serve.listen(port, () => {
    console.log(`Listening on the port ${port}`);
}).on('error', e => {
    console.error(e);
});

const peerjsApp = peerjsServer({
    port: 9000,
    path: '/'
})
app.use('/peerjs', ExpressPeerServer(peerjsApp));

