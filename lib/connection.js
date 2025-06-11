import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';

class ConnectionService {
  async isOnline() {
    try {
      // Lightweight ping query to test connectivity
      await convex.query(api.commands.ping);
      return true;
    } catch {
      return false;
    }
  }
}

const connectionService = new ConnectionService();
export default connectionService;

