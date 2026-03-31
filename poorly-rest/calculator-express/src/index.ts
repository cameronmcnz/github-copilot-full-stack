import express, { Request, Response } from 'express';

const app = express();
const port = 3007;

type Operation = (a: number, b: number) => number;

function parseNumber(value: unknown): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getOperands(req: Request): { a: number; b: number } | null {
  const a = parseNumber(req.query.a);
  const b = parseNumber(req.query.b);

  if (a === null || b === null) {
    return null;
  }

  return { a, b };
}

function handleBinaryOperation(name: string, operation: Operation) {
  return (req: Request, res: Response): void => {
    const operands = getOperands(req);

    if (!operands) {
      res.status(400).json({ message: 'Query parameters a and b are required and must be valid numbers.' });
      return;
    }

    console.log(`[express] ${name} invoked with a=${operands.a}, b=${operands.b}`);
    res.json({ result: operation(operands.a, operands.b) });
  };
}

app.get('/operations/add', handleBinaryOperation('add', (a, b) => a + b));
app.get('/operations/subtract', handleBinaryOperation('subtract', (a, b) => a - b));
app.get('/operations/multiply', handleBinaryOperation('multiply', (a, b) => a * b));
app.get(
  '/operations/divide',
  (req: Request, res: Response): void => {
    const operands = getOperands(req);

    if (!operands) {
      res.status(400).json({ message: 'Query parameters a and b are required and must be valid numbers.' });
      return;
    }

    console.log(`[express] divide invoked with a=${operands.a}, b=${operands.b}`);

    if (operands.b === 0) {
      res.status(422).json({ message: 'Division by zero is not allowed.' });
      return;
    }

    res.json({ result: operands.a / operands.b });
  }
);

app.get(
  '/operations/modulus',
  (req: Request, res: Response): void => {
    const operands = getOperands(req);

    if (!operands) {
      res.status(400).json({ message: 'Query parameters a and b are required and must be valid numbers.' });
      return;
    }

    console.log(`[express] modulus invoked with a=${operands.a}, b=${operands.b}`);

    if (operands.b === 0) {
      res.status(422).json({ message: 'Division by zero is not allowed.' });
      return;
    }

    res.json({ result: operands.a % operands.b });
  }
);

app.listen(port, () => {
  console.log(`[express] calculator service listening on http://localhost:${port}`);
});