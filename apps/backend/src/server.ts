import { createApp } from './app';

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`\n\n- Sky Light Backend running on http://localhost:${PORT}`);
  console.log(`- API available at http://localhost:${PORT}/api/v1`);
  console.log(`- Health check at http://localhost:${PORT}/health\n\n`);
});

