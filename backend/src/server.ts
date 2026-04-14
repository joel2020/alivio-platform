import { app } from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`Alivio multi-agent backend running on http://localhost:${env.port}`);
});
