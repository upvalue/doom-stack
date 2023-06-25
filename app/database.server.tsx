import { Client } from "pg";
import { selectOne } from "./queries/sample.queries";

const withDb = async <T,>(callback: (client: Client) => Promise<T>) => {
  const client = new Client();

  await client.connect();
  const res = await callback(client);
  await client.end();
  return res;
};

export const sampleQuery = async () => {
  return await withDb(async (client) => {
    return await selectOne.run(undefined, client);
  });
};
