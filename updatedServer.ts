import { option as O, either as E } from "fp-ts";
import { flow, pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

// "Server"
const databaseLookup = (id: number): Record<string, string> | 404 =>
  ({
    1: { name: "Peter Sagan", status: "Fading" },
    2: { name: "Tadej Pogačar", status: "Rising" },
    4: { nome: "Lance Armstrong", status: "Shameless" },
    7: { name: "Marianne Vos", status: "GOAT" },
  }[id] || 404);

const networkEndpoint = (
  id: number
): 404 | Record<string, string> | undefined =>
  Math.random() < 0.67 ? databaseLookup(id) : undefined;

// "Client"
const RiderData = t.type({ name: t.string, status: t.string });
type RiderData = t.TypeOf<typeof RiderData>;

type RequestResult = E.Either<string | t.Errors, O.Option<RiderData>>;

const requestData: (id: number) => RequestResult =
  flow(
    networkEndpoint,
    E.fromNullable("Gremlins stuck in the machine"),
    E.chainW((response) =>
      response === 404
        ? E.of(O.none)
        : pipe(response, RiderData.decode, E.map(O.of))
    )
  );

const handle200 = (data: RiderData) => {
  console.log(`Found ${data.name}, status: ${data.status}`);
};

const handle404 = () => {
  console.log("Result not found");
};

const handle500 = (error: unknown) => {
  console.error(`Error (server or data): ${JSON.stringify(error, null, 2)}`);
};

const render = (data: RequestResult) => {
  pipe(data, E.match(handle500, O.match(handle404, handle200)));
};

pipe(4, requestData, render);
