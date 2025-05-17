import './style.scss';
interface Message {
  content: string;
  timestamp: string;
  type: 'sent' | 'received';
}

class WebSocketClient {
  private socket: WebSocket | null = null;
  private messages: Message[] = [];
  private addressInput: HTMLInputElement;
  private portInput: HTMLInputElement;
  private connectBtn: HTMLButtonElement;
  private statusText: HTMLElement;
  private statusIndicator: HTMLElement;
  private messageInput: HTMLTextAreaElement;
  private sendBtn: HTMLButtonElement;
  private sentMessages: HTMLElement;
  private receivedMessages: HTMLElement;

  constructor() {
    this.addressInput = document.getElementById('address-input') as HTMLInputElement;
    this.portInput = document.getElementById('port-input') as HTMLInputElement;
    this.connectBtn = document.getElementById('connect-btn') as HTMLButtonElement;
    this.statusText = document.getElementById('status-text') as HTMLElement;
    this.statusIndicator = document.getElementById('status-indicator') as HTMLElement;
    this.messageInput = document.getElementById('message-input') as HTMLTextAreaElement;
    this.sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
    this.sentMessages = document.getElementById('sent-messages') as HTMLElement;
    this.receivedMessages = document.getElementById('received-messages') as HTMLElement;

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.connectBtn.addEventListener('click', () => this.toggleConnection());
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('input', () => this.prettifyJSON());
  }

  private toggleConnection(): void {
    console.log('toggleConnection');
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.disconnect();
    } else {
      this.connect();
    }
  }

  private connect(): void {
    const address = this.addressInput.value.trim();
    const port = this.portInput.value.trim();
    if (!address || !port) {
      alert('Please enter both address and port.');
      return;
    }

    const url = `${address}:${port}`;
    try {
      this.socket = new WebSocket(url);
      this.setupWebSocketEvents();
      this.updateUIConnecting();
    } catch (error) {
      alert('Invalid WebSocket URL.');
    }
  }

  private disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.updateUIDisconnected();
    }
  }

  private setupWebSocketEvents(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.updateUIConnected();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const message: Message = {
        content: this.formatMessage(event.data),
        timestamp: new Date().toLocaleString(),
        type: 'received',
      };
      this.messages.push(message);
      this.renderMessages();
      this.scrollToBottom(this.receivedMessages);
    };

    this.socket.onclose = () => {
      this.updateUIDisconnected();
    };

    this.socket.onerror = () => {
      alert('WebSocket error occurred.');
      this.disconnect();
    };
  }

  private updateUIConnecting(): void {
    this.statusText.textContent = 'Connecting...';
    this.connectBtn.disabled = true;
    console.log('connect button disabled');
  }

  private updateUIConnected(): void {
    this.statusText.textContent = 'Connected';
    this.statusIndicator.classList.remove('disconnected');
    this.statusIndicator.classList.add('connected');
    this.connectBtn.textContent = 'Disconnect';
    this.connectBtn.classList.add('connected');
    this.connectBtn.disabled = false;
  }

  private updateUIDisconnected(): void {
    console.log('updateUIDisconnected');
    this.statusText.textContent = 'Disconnected';
    this.statusIndicator.classList.remove('connected');
    this.statusIndicator.classList.add('disconnected');
    this.connectBtn.textContent = 'Connect';
    this.connectBtn.classList.remove('connected');
    this.connectBtn.disabled = false;
    console.log('connect button enabled');
  }

  private sendMessage(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      alert('Not connected to WebSocket.');
      return;
    }

    const content = this.messageInput.value.trim();
    if (!content) return;

    this.socket.send(content);
    const message: Message = {
      content: this.formatMessage(content),
      timestamp: new Date().toLocaleString(),
      type: 'sent',
    };
    this.messages.push(message);
    this.renderMessages();
    this.messageInput.value = '';
    this.scrollToBottom(this.sentMessages);
  }

  private prettifyJSON(): void {
    const input = this.messageInput.value.trim();
    if (!input) return;

    try {
      const json = JSON.parse(input);
      this.messageInput.value = JSON.stringify(json, null, 2);
    } catch (error) {
      // Not valid JSON, do nothing
    }
  }

  private formatMessage(data: any): string {
    try {
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  }

  private renderMessages(): void {
    this.sentMessages.innerHTML = '';
    this.receivedMessages.innerHTML = '';

    this.messages.forEach((message) => {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message-item');
      messageElement.innerHTML = `
        <div class="timestamp">${message.timestamp}</div>
        <pre>${message.content}</pre>
      `;

      if (message.type === 'sent') {
        this.sentMessages.appendChild(messageElement);
      } else {
        this.receivedMessages.appendChild(messageElement);
      }
    });
  }

  private scrollToBottom(element: HTMLElement): void {
    element.scrollTop = element.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WebSocketClient();
});