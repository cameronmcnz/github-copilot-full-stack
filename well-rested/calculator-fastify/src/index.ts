import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';

type ErrorBody = {
  code: string;
  message: string;
};

const app = Fastify();
const port = Number(process.env.PORT ?? 3001);

app.register(cors, {
  origin: 'http://localhost:3004',
  methods: ['GET']
});

type SumQuery = { augend?: string; addend?: string };
type DifferenceQuery = { minuend?: string; subtrahend?: string };
type ProductQuery = { multiplicand?: string; multiplier?: string };
type DivisionQuery = { dividend?: string; divisor?: string };

const badRequest = (reply: FastifyReply) => {
  return reply.code(400).send({
    code: 'bad_request',
    message: 'Both required numeric parameters must be provided.'
  });
};

const toNumber = (value: string | undefined): number | null => {
  if (value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

app.get<{ Querystring: SumQuery }>('/sum', async (request, reply) => {
  const augend = toNumber(request.query.augend);
  const addend = toNumber(request.query.addend);
  if (augend === null || addend === null) {
    return badRequest(reply);
  }
  console.log(`[calculator-fastify] /sum called with augend=${augend}, addend=${addend}`);
  return augend + addend;
});

app.get<{ Querystring: DifferenceQuery }>('/difference', async (request, reply) => {
  const minuend = toNumber(request.query.minuend);
  const subtrahend = toNumber(request.query.subtrahend);
  if (minuend === null || subtrahend === null) {
    return badRequest(reply);
  }
  console.log(`[calculator-fastify] /difference called with minuend=${minuend}, subtrahend=${subtrahend}`);
  return minuend - subtrahend;
});

app.get<{ Querystring: ProductQuery }>('/product', async (request, reply) => {
  const multiplicand = toNumber(request.query.multiplicand);
  const multiplier = toNumber(request.query.multiplier);
  if (multiplicand === null || multiplier === null) {
    return badRequest(reply);
  }
  console.log(`[calculator-fastify] /product called with multiplicand=${multiplicand}, multiplier=${multiplier}`);
  return multiplicand * multiplier;
});

app.get<{ Querystring: DivisionQuery }>('/quotient', async (request, reply) => {
  const dividend = toNumber(request.query.dividend);
  const divisor = toNumber(request.query.divisor);
  if (dividend === null || divisor === null) {
    return badRequest(reply);
  }
  console.log(`[calculator-fastify] /quotient called with dividend=${dividend}, divisor=${divisor}`);

  if (divisor === 0) {
    const body: ErrorBody = {
      code: 'invalid_calculation',
      message: 'Divisor must not be zero.'
    };
    return reply.code(422).send(body);
  }

  return dividend / divisor;
});

app.get<{ Querystring: DivisionQuery }>('/remainder', async (request, reply) => {
  const dividend = toNumber(request.query.dividend);
  const divisor = toNumber(request.query.divisor);
  if (dividend === null || divisor === null) {
    return badRequest(reply);
  }
  console.log(`[calculator-fastify] /remainder called with dividend=${dividend}, divisor=${divisor}`);

  if (divisor === 0) {
    const body: ErrorBody = {
      code: 'invalid_calculation',
      message: 'Divisor must not be zero.'
    };
    return reply.code(422).send(body);
  }

  return dividend % divisor;
});

app.setErrorHandler((error: any, _request: FastifyRequest, reply: FastifyReply) => {
  if (error?.validation) {
    badRequest(reply);
    return;
  }

  app.log.error(error);
  reply.code(500).send({
    code: 'internal_error',
    message: 'Unexpected server error.'
  });
});

const start = async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`[calculator-fastify] listening on http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
