import { app } from './app';

const port = 3010;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;
