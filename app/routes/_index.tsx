import type { V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { sampleQuery } from "~/database.server";

export const meta: V2_MetaFunction = () => [{ title: "doom!!!" }];

export async function loader() {
  const one = await sampleQuery();
  return one;
}

export default function Index() {
  const [one] = useLoaderData<[{ one: string }]>();
  return (
    <main>
      doom
      {one.one}
    </main>
  );
}
