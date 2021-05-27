import { option as O, either as E } from "fp-ts";
import { flow, pipe } from "fp-ts/lib/function";

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
interface RiderData {
  name: string;
  status: string;
}

type RequestResult = E.Either<string, O.Option<RiderData>>;

const requestData: (id: number) => RequestResult = flow(
  networkEndpoint,
  E.fromNullable("Gremlins stuck in the machine"),
  E.map(O.fromPredicate((data) => data !== 404))
) as (id: number) => RequestResult;

const handle200 = (data: RiderData) => {
  console.log(`Found ${data.name}, status: ${data.status}`);
};

const handle404 = () => {
  console.log("Result not found");
};

const handle500 = (error: string) => {
  console.error(`Server error: ${error}`);
};

const render: (data: RequestResult) => void =
  E.match(handle500, O.match(handle404, handle200));

pipe(4, requestData, render);
