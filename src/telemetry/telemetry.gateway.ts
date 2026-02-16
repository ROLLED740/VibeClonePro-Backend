import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for dev
  },
})
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('status', { message: 'Connected to VibeClonePro Telemetry' });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToBuild')
  handleSubscribe(@MessageBody() data: string): string {
    return 'Subscribed to build updates provided by ' + data;
  }

  // Method to be called by other services to broadcast updates
  broadcastUpdate(event: string, data: any) {
    this.server.emit(event, data);
  }
}
