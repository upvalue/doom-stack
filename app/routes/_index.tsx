import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [{ title: "doom!!!" }];

export default function Index() {
  return (
    <main>
      doom
    </main>
  );
}
