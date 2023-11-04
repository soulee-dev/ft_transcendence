import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtWsGuard } from '../auth/jwt-ws.guard';
import { Server, Socket } from 'socket.io';
import { ExtendedSocket } from '../auth/jwtWsGuard.interface';
import { GamesService } from './games.service';

@WebSocketGateway({
  cors: {
    origin: `http://${process.env.HOST}:${process.env.FE_PORT}`,
    credentials: true,
  },
})
@UseGuards(JwtWsGuard)
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly gameService: GamesService) {}
  afterInit(server: Server) {
    this.gameService.server = server;
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('a user connected');
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected');
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket) {
    this.gameService.joinGame(client);
  }

  @SubscribeMessage('move')
  handleMove(client: Socket, payload: any) {
    this.gameService.movePlayer(client, payload);
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, roomID: string) {
    client.leave(roomID);
  }
}
