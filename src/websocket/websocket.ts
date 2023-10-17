import { SUBSCRIBE_EVENT, UNSUBSCRIBE_EVENT } from "./events";

export class WebSocketMessage {
  topic: string;
  event: string;
  payload: any;

  constructor(topic: string, event: string, payload?: any) {
    this.topic = topic;
    this.event = event;
    this.payload = payload || "";
  }
}

type WebSocketMessageHandler = (message: WebSocketMessage) => void;

export class CroChessWebSocket {
  private websocket: WebSocket;
  private subscriptions: { [key: string]: CroChessWebSocketSubscription };
  private onDisconnect: () => void;

  constructor(
    url: string,
    onConnect: (conn: CroChessWebSocket) => void,
    onDisconnect: () => void,
  ) {
    this.websocket = new WebSocket(url);
    this.subscriptions = {
      error: new CroChessWebSocketSubscription("error", this, function (
        message,
      ) {
        console.error(message.payload);
      }),
    };
    this.onDisconnect = onDisconnect;

    this.websocket.onopen = function (this: CroChessWebSocket) {
      onConnect(this);

      this.websocket.onmessage = function (
        this: CroChessWebSocket,
        ev: MessageEvent<any>,
      ) {
        const message = JSON.parse(ev.data) as WebSocketMessage;

        if (message.topic in this.subscriptions) {
          this.subscriptions[message.topic].messageHandler(message);
        } else {
          console.warn(
            `received message for topic: "${message.topic}" but you are not subscribed`,
          );
        }
      }.bind(this);

      this.websocket.onclose = function (
        this: CroChessWebSocket,
        ev: CloseEvent,
      ) {
        console.log("disconnected: ", ev.reason);
        console.log("reconnecting...");

        new CroChessWebSocket(
          url,
          (conn) => {
            onConnect(conn);
            // Object.entries(this.subscriptions).forEach(([topic, sub]) => {
            //   if (topic === "error") return;
            //   conn.subscribe(topic, sub.messageHandler);
            // });
          },
          onDisconnect,
        );
      }.bind(this);
    }.bind(this);
  }

  close() {
    this.websocket.close();
    this.onDisconnect();
  }

  active(): boolean {
    return this.websocket.readyState === WebSocket.OPEN;
  }

  subscribe(
    topic: string,
    cb: WebSocketMessageHandler,
  ): CroChessWebSocketSubscription {
    const subscribeMessage = JSON.stringify(
      new WebSocketMessage(topic, SUBSCRIBE_EVENT),
    );
    this.websocket.send(subscribeMessage);

    const subscription = new CroChessWebSocketSubscription(topic, this, cb);
    if (this.subscriptions) {
      this.subscriptions[topic] = subscription;
    } else {
      this.subscriptions = { [topic]: subscription };
    }

    return subscription;
  }

  unsubscribe(topic: string) {
    const unsubscribeMessage = JSON.stringify(
      new WebSocketMessage(topic, UNSUBSCRIBE_EVENT),
    );
    this.websocket.send(unsubscribeMessage);

    delete this.subscriptions[topic];
  }

  publish(message: WebSocketMessage) {
    this.websocket.send(JSON.stringify(message));
  }
}

class CroChessWebSocketSubscription {
  topic: string;
  socketConnection: CroChessWebSocket;
  messageHandler: WebSocketMessageHandler;

  constructor(
    topic: string,
    connection: CroChessWebSocket,
    messageHandler: WebSocketMessageHandler,
  ) {
    this.topic = topic;
    this.socketConnection = connection;
    this.messageHandler = messageHandler;
  }

  unsubscribe() {
    this.socketConnection.unsubscribe(this.topic);
  }
}
